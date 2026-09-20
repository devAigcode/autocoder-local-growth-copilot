const ENTITY_MAP = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  nbsp: ' ',
  quot: '"'
};

export function decodeEntities(value = '') {
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity) => {
    const normalized = entity.toLowerCase();
    if (normalized.startsWith('#x')) {
      return String.fromCodePoint(Number.parseInt(normalized.slice(2), 16));
    }
    if (normalized.startsWith('#')) {
      return String.fromCodePoint(Number.parseInt(normalized.slice(1), 10));
    }
    return ENTITY_MAP[normalized] ?? match;
  });
}

export function stripTags(value = '') {
  return decodeEntities(value.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

export function parseAttributes(tag = '') {
  const attributes = {};
  const pattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  const opening = tag.replace(/^<\/?\s*[a-z0-9:-]+/i, '').replace(/\/?\s*>$/, '');
  let match;

  while ((match = pattern.exec(opening))) {
    attributes[match[1].toLowerCase()] = decodeEntities(match[2] ?? match[3] ?? match[4] ?? '');
  }

  return attributes;
}

export function findTags(html, tagName) {
  const pattern = new RegExp(`<${tagName}\\b[^>]*>`, 'gi');
  return [...html.matchAll(pattern)].map((match) => ({
    attributes: parseAttributes(match[0]),
    source: match[0]
  }));
}

export function findTagContents(html, tagName) {
  const pattern = new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}\\s*>`, 'gi');
  return [...html.matchAll(pattern)].map((match) => stripTags(match[1]));
}

export function getMetaContent(html, key, expectedValue) {
  const normalizedExpected = expectedValue.toLowerCase();
  const match = findTags(html, 'meta').find(({ attributes }) =>
    attributes[key]?.toLowerCase() === normalizedExpected
  );
  return match?.attributes.content?.trim() ?? '';
}

export function getLinkHref(html, relation) {
  const normalizedRelation = relation.toLowerCase();
  const match = findTags(html, 'link').find(({ attributes }) =>
    attributes.rel?.toLowerCase().split(/\s+/).includes(normalizedRelation)
  );
  return match?.attributes.href?.trim() ?? '';
}

export function getVisibleText(html) {
  const withoutHiddenContent = html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script\b[\s\S]*?<\/script\s*>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style\s*>/gi, ' ')
    .replace(/<template\b[\s\S]*?<\/template\s*>/gi, ' ')
    .replace(/<noscript\b[\s\S]*?<\/noscript\s*>/gi, ' ');
  return stripTags(withoutHiddenContent);
}

export function getInteractiveLabels(html) {
  const pattern = /<(a|button)\b[^>]*>([\s\S]*?)<\/\1\s*>/gi;
  return [...html.matchAll(pattern)]
    .map((match) => stripTags(match[2]))
    .filter(Boolean);
}

export function getJsonLd(html) {
  const scripts = [];
  const pattern = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
  let match;

  while ((match = pattern.exec(html))) {
    const attributes = parseAttributes(`<script ${match[1]}>`);
    if (attributes.type?.toLowerCase() !== 'application/ld+json') continue;
    try {
      scripts.push(JSON.parse(match[2].trim()));
    } catch {
      scripts.push({ __parseError: true });
    }
  }

  return scripts;
}

export function flattenJsonLd(value) {
  if (Array.isArray(value)) return value.flatMap(flattenJsonLd);
  if (!value || typeof value !== 'object') return [];
  const nested = value['@graph'] ? flattenJsonLd(value['@graph']) : [];
  return [value, ...nested];
}
