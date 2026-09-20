import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_BYTES = 1_500_000;
const DEFAULT_MAX_REDIRECTS = 5;
const USER_AGENT = 'AutoCoderGrowthCopilot/0.1 (+https://github.com/devAigcode/autocoder-local-growth-copilot)';

function isPrivateIpv4(address) {
  const parts = address.split('.').map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return true;
  }

  const [a, b] = parts;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function isPrivateIpv6(address) {
  const normalized = address.toLowerCase().split('%')[0];
  return (
    normalized === '::' ||
    normalized === '::1' ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    /^fe[89ab]/.test(normalized) ||
    normalized.startsWith('ff') ||
    normalized.startsWith('2001:db8:')
  );
}

export function isPrivateAddress(address) {
  const version = isIP(address);
  if (version === 4) return isPrivateIpv4(address);
  if (version === 6) return isPrivateIpv6(address);
  return true;
}

export function normalizeUrl(input) {
  let url;
  try {
    url = new URL(input);
  } catch {
    throw new Error(`Invalid URL: ${input}`);
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Only HTTP and HTTPS URLs are supported.');
  }
  if (url.username || url.password) {
    throw new Error('URLs containing credentials are not supported.');
  }
  url.hash = '';
  return url;
}

export async function assertPublicUrl(input) {
  const url = input instanceof URL ? input : normalizeUrl(input);
  const hostname = url.hostname.toLowerCase();

  if (hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local')) {
    throw new Error(`Private or local hostnames are not supported: ${hostname}`);
  }

  const literalVersion = isIP(hostname);
  const addresses = literalVersion
    ? [{ address: hostname }]
    : await lookup(hostname, { all: true, verbatim: true });

  if (addresses.length === 0 || addresses.some(({ address }) => isPrivateAddress(address))) {
    throw new Error(`The URL does not resolve exclusively to public IP addresses: ${hostname}`);
  }

  return url;
}

async function readLimitedBody(response, maxBytes) {
  const declaredLength = Number(response.headers.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new Error(`Response is larger than the ${maxBytes}-byte limit.`);
  }

  if (!response.body) return '';

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let total = 0;
  let result = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new Error(`Response exceeded the ${maxBytes}-byte limit.`);
    }
    result += decoder.decode(value, { stream: true });
  }

  return result + decoder.decode();
}

export async function safeFetchText(input, options = {}) {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    maxBytes = DEFAULT_MAX_BYTES,
    maxRedirects = DEFAULT_MAX_REDIRECTS
  } = options;

  let currentUrl = await assertPublicUrl(input);

  for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    let response;

    try {
      response = await fetch(currentUrl, {
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          accept: 'text/html,application/xhtml+xml,application/xml,text/plain;q=0.9,*/*;q=0.1',
          'user-agent': USER_AGENT
        }
      });
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timed out after ${timeoutMs} ms: ${currentUrl}`);
      }
      throw new Error(`Could not fetch ${currentUrl}: ${error.message}`);
    } finally {
      clearTimeout(timeout);
    }

    if (response.status >= 300 && response.status < 400 && response.headers.has('location')) {
      if (redirectCount === maxRedirects) {
        throw new Error(`Too many redirects while fetching ${input}`);
      }
      currentUrl = await assertPublicUrl(new URL(response.headers.get('location'), currentUrl));
      continue;
    }

    return {
      body: await readLimitedBody(response, maxBytes),
      headers: Object.fromEntries(response.headers.entries()),
      status: response.status,
      url: currentUrl.toString()
    };
  }

  throw new Error(`Could not fetch ${input}`);
}

export { USER_AGENT };
