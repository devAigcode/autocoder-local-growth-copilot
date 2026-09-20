import { safeFetchText, normalizeUrl } from './fetch.js';
import { buildSnapshot, evaluateLaunchCheck, scoreFindings, selectTopActions } from './rules.js';

const TOOL_VERSION = '0.1.0';
const RULESET_VERSION = '2026-09-20';

function cleanContext(context = {}) {
  return Object.fromEntries(
    Object.entries(context)
      .filter(([, value]) => typeof value === 'string' && value.trim())
      .map(([key, value]) => [key, value.trim()])
  );
}

async function inspectOptionalResource(url, fetcher) {
  try {
    return await fetcher(url);
  } catch (error) {
    return {
      body: '',
      error: error.message,
      status: null,
      url: url.toString()
    };
  }
}

function sitemapUrlFromRobots(robots, baseUrl) {
  if (robots.status !== 200) return new URL('/sitemap.xml', baseUrl);
  const match = robots.body.match(/^\s*sitemap\s*:\s*(\S+)\s*$/im);
  if (!match) return new URL('/sitemap.xml', baseUrl);
  try {
    return new URL(match[1], baseUrl);
  } catch {
    return new URL('/sitemap.xml', baseUrl);
  }
}

export async function auditSite(inputUrl, options = {}) {
  const fetcher = options.fetcher ?? safeFetchText;
  const requestedUrl = normalizeUrl(inputUrl);
  const startedAt = new Date().toISOString();
  const homepage = await fetcher(requestedUrl);

  if (homepage.status < 200 || homepage.status >= 400) {
    throw new Error(`Homepage returned HTTP ${homepage.status}: ${homepage.url}`);
  }

  const finalUrl = new URL(homepage.url);
  const robotsUrl = new URL('/robots.txt', finalUrl);
  const robots = await inspectOptionalResource(robotsUrl, fetcher);
  const sitemapUrl = sitemapUrlFromRobots(robots, finalUrl);
  const sitemap = await inspectOptionalResource(sitemapUrl, fetcher);
  const context = cleanContext(options.context);
  const snapshot = buildSnapshot({
    html: homepage.body,
    homepage,
    robots,
    sitemap,
    context
  });
  const findings = evaluateLaunchCheck(snapshot);
  const scores = scoreFindings(findings);
  const topActions = selectTopActions(findings);
  const contentType = homepage.headers?.['content-type'] ?? '';
  const limitations = [
    'The Launch Check analyzes public page content and does not use private analytics or search performance data.',
    'The initial release inspects the homepage, robots.txt, and one sitemap candidate; it does not crawl the full site.',
    'Scores are diagnostic indicators and do not guarantee rankings, traffic, leads, or revenue.'
  ];

  if (contentType && !/html|xhtml/i.test(contentType)) {
    limitations.push(`The homepage content type was “${contentType}”, so HTML findings may be incomplete.`);
  }

  return {
    schemaVersion: '1.0',
    tool: {
      name: 'AutoCoder Local Growth Copilot',
      version: TOOL_VERSION,
      rulesetVersion: RULESET_VERSION
    },
    audit: {
      startedAt,
      inputUrl: requestedUrl.toString(),
      siteUrl: finalUrl.toString(),
      context
    },
    inspectedResources: [homepage, robots, sitemap].map((resource) => ({
      error: resource.error,
      status: resource.status,
      url: resource.url
    })),
    scores,
    topActions,
    findings,
    limitations
  };
}

export { RULESET_VERSION, TOOL_VERSION };
