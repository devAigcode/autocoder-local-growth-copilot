import {
  findTagContents,
  findTags,
  flattenJsonLd,
  getInteractiveLabels,
  getJsonLd,
  getLinkHref,
  getMetaContent,
  getVisibleText
} from './html.js';

const CATEGORY_LABELS = {
  discoverability: 'Discoverability',
  localRelevance: 'Local relevance',
  conversionReadiness: 'Conversion readiness'
};

const LOCAL_BUSINESS_TYPES = new Set([
  'AutomotiveBusiness',
  'Bakery',
  'BeautySalon',
  'CafeOrCoffeeShop',
  'DaySpa',
  'Dentist',
  'DryCleaningOrLaundry',
  'Electrician',
  'EmergencyService',
  'EmploymentAgency',
  'EntertainmentBusiness',
  'FinancialService',
  'FoodEstablishment',
  'GeneralContractor',
  'GovernmentOffice',
  'HairSalon',
  'HealthAndBeautyBusiness',
  'HomeAndConstructionBusiness',
  'HousePainter',
  'HVACBusiness',
  'InternetCafe',
  'LegalService',
  'Library',
  'LocalBusiness',
  'Locksmith',
  'LodgingBusiness',
  'MedicalBusiness',
  'MovingCompany',
  'NailSalon',
  'Plumber',
  'ProfessionalService',
  'RadioStation',
  'RealEstateAgent',
  'RecyclingCenter',
  'Restaurant',
  'RoofingContractor',
  'SelfStorage',
  'ShoppingCenter',
  'SportsActivityLocation',
  'Store',
  'TelevisionStation',
  'TouristInformationCenter',
  'TravelAgency'
]);

function finding({
  id,
  category,
  title,
  status,
  severity = 'medium',
  weight = 1,
  effort = 1,
  evidence,
  explanation,
  recommendation,
  url
}) {
  return {
    id,
    category,
    categoryLabel: CATEGORY_LABELS[category],
    title,
    status,
    severity,
    weight,
    effort,
    evidence,
    explanation,
    recommendation,
    affectedUrls: url ? [url] : []
  };
}

function includesPhrase(text, phrase) {
  return text.toLocaleLowerCase().includes(phrase.toLocaleLowerCase());
}

function contextRule({ id, title, key, value, text, url, recommendation }) {
  if (!value) {
    return finding({
      id,
      category: 'localRelevance',
      title,
      status: 'not-applicable',
      severity: 'medium',
      weight: 2,
      evidence: `No ${key} was provided for comparison.`,
      explanation: `The check needs optional ${key} context to avoid guessing.`,
      recommendation: `Provide --${key} or include it in a profile file.`,
      url
    });
  }

  const present = includesPhrase(text, value);
  return finding({
    id,
    category: 'localRelevance',
    title,
    status: present ? 'pass' : 'fail',
    severity: 'high',
    weight: 3,
    effort: 1,
    evidence: present
      ? `The page visibly mentions “${value}”.`
      : `The page does not visibly mention “${value}”.`,
    explanation: present
      ? `Visitors can connect the business with its primary ${key}.`
      : `Visitors and search systems may not clearly connect the business with its primary ${key}.`,
    recommendation,
    url
  });
}

function collectSchemaTypes(jsonLd) {
  return jsonLd
    .flatMap(flattenJsonLd)
    .flatMap((item) => {
      const type = item['@type'];
      return Array.isArray(type) ? type : [type];
    })
    .filter((type) => typeof type === 'string');
}

function isLocalBusinessType(type) {
  return LOCAL_BUSINESS_TYPES.has(type) || type.endsWith('Business');
}

function goalPhrases(goal) {
  const phrases = {
    booking: ['book', 'schedule', 'reserve', 'appointment'],
    call: ['call', 'phone'],
    contact: ['contact', 'get in touch', 'message us'],
    quote: ['quote', 'estimate', 'pricing'],
    visit: ['directions', 'visit', 'find us', 'location']
  };
  return goal ? phrases[goal] : Object.values(phrases).flat();
}

export function buildSnapshot({ html, homepage, robots, sitemap, context = {}, rendering = {} }) {
  const titles = findTagContents(html, 'title');
  const headings = findTagContents(html, 'h1');
  const jsonLd = getJsonLd(html);
  const visibleText = getVisibleText(html);

  return {
    canonical: getLinkHref(html, 'canonical'),
    context,
    headings,
    homepage,
    html,
    interactiveLabels: getInteractiveLabels(html),
    jsonLd,
    metaDescription: getMetaContent(html, 'name', 'description'),
    metaRobots: getMetaContent(html, 'name', 'robots'),
    rendering,
    robots,
    schemaTypes: collectSchemaTypes(jsonLd),
    sitemap,
    title: titles[0] ?? '',
    visibleText,
    viewport: getMetaContent(html, 'name', 'viewport')
  };
}

export function evaluateLaunchCheck(snapshot) {
  const {
    canonical,
    context,
    headings,
    homepage,
    html,
    interactiveLabels,
    jsonLd,
    metaDescription,
    metaRobots,
    robots,
    schemaTypes,
    sitemap,
    title,
    viewport,
    visibleText
  } = snapshot;
  const url = homepage.url;
  const findings = [];

  findings.push(finding({
    id: 'discoverability.title',
    category: 'discoverability',
    title: 'Descriptive page title',
    status: !title ? 'fail' : title.length < 15 || title.length > 65 ? 'warning' : 'pass',
    severity: 'high',
    weight: 3,
    effort: 1,
    evidence: title ? `Title: “${title}” (${title.length} characters).` : 'No title element was found.',
    explanation: 'The title helps people and search systems understand the page before they visit it.',
    recommendation: 'Write a concise homepage title that names the primary service, location, and business when natural.',
    url
  }));

  findings.push(finding({
    id: 'discoverability.meta-description',
    category: 'discoverability',
    title: 'Meta description',
    status: !metaDescription ? 'fail' : metaDescription.length < 70 || metaDescription.length > 170 ? 'warning' : 'pass',
    severity: 'medium',
    weight: 2,
    effort: 1,
    evidence: metaDescription
      ? `Meta description: “${metaDescription}” (${metaDescription.length} characters).`
      : 'No meta description was found.',
    explanation: 'A clear description can help a searcher understand the offer before opening the page.',
    recommendation: 'Add a specific description of the service, location, and next step.',
    url
  }));

  findings.push(finding({
    id: 'discoverability.primary-heading',
    category: 'discoverability',
    title: 'Primary heading',
    status: headings.length === 1 ? 'pass' : headings.length === 0 ? 'fail' : 'warning',
    severity: 'high',
    weight: 3,
    effort: 1,
    evidence: headings.length === 0
      ? 'No H1 heading was found.'
      : `${headings.length} H1 heading${headings.length === 1 ? '' : 's'} found: ${headings.map((heading) => `“${heading}”`).join(', ')}.`,
    explanation: 'A clear primary heading states the main promise of the page.',
    recommendation: 'Use one visible H1 that clearly describes the primary service and audience.',
    url
  }));

  const hasNoIndex = /(?:^|[,\s])noindex(?:$|[,\s])/i.test(metaRobots);
  findings.push(finding({
    id: 'discoverability.indexability',
    category: 'discoverability',
    title: 'Homepage indexability',
    status: hasNoIndex ? 'fail' : 'pass',
    severity: 'critical',
    weight: 5,
    effort: 1,
    evidence: metaRobots ? `Robots directive: “${metaRobots}”.` : 'No page-level noindex directive was found.',
    explanation: hasNoIndex
      ? 'The homepage asks search engines not to include it in search results.'
      : 'No page-level directive prevents the homepage from being indexed.',
    recommendation: 'Remove the noindex directive before launch if the homepage should appear in search.',
    url
  }));

  let canonicalStatus = 'fail';
  let canonicalEvidence = 'No canonical URL was found.';
  if (canonical) {
    try {
      const resolvedCanonical = new URL(canonical, url);
      canonicalStatus = resolvedCanonical.origin === new URL(url).origin ? 'pass' : 'warning';
      canonicalEvidence = `Canonical URL: ${resolvedCanonical}`;
    } catch {
      canonicalStatus = 'warning';
      canonicalEvidence = `The canonical value is not a valid URL: “${canonical}”.`;
    }
  }
  findings.push(finding({
    id: 'discoverability.canonical',
    category: 'discoverability',
    title: 'Canonical URL',
    status: canonicalStatus,
    severity: 'medium',
    weight: 2,
    effort: 1,
    evidence: canonicalEvidence,
    explanation: 'A canonical URL identifies the preferred version of a page.',
    recommendation: 'Add a valid self-referencing canonical URL to the homepage.',
    url
  }));

  const robotsContentType = robots?.headers?.['content-type'] ?? '';
  const robotsLooksHtml = /html/i.test(robotsContentType) || /^\s*(?:<!doctype\s+html|<html\b)/i.test(robots?.body ?? '');
  const validRobots = robots?.status === 200
    && !robotsLooksHtml
    && /^\s*(?:user-agent|sitemap)\s*:/im.test(robots.body);
  const blocksAll = validRobots && /user-agent\s*:\s*\*[\s\S]*?disallow\s*:\s*\/(?:\s|$)/i.test(robots.body);
  const robotsStatus = blocksAll ? 'fail' : validRobots ? 'pass' : robots?.status === 200 ? 'fail' : 'warning';
  findings.push(finding({
    id: 'discoverability.robots',
    category: 'discoverability',
    title: 'Crawler access',
    status: robotsStatus,
    severity: blocksAll ? 'critical' : validRobots ? 'low' : 'medium',
    weight: blocksAll ? 5 : validRobots ? 1 : 2,
    effort: 1,
    evidence: blocksAll
      ? `${robots.url} appears to disallow all crawling.`
      : validRobots
        ? `robots.txt returned HTTP ${robots.status} with valid crawler directives.`
        : robots?.status === 200 && robotsLooksHtml
          ? `robots.txt returned HTML (${robotsContentType || 'unknown content type'}) instead of crawler directives.`
          : robots?.status === 200
            ? 'robots.txt returned HTTP 200 but did not contain a User-agent or Sitemap directive.'
        : robots?.error ?? `robots.txt returned HTTP ${robots?.status ?? 'unknown'}.`,
    explanation: blocksAll
      ? 'A site-wide disallow rule can prevent search engines from crawling public pages.'
      : validRobots
        ? 'The robots file contains recognizable crawler directives.'
        : 'A valid robots file must contain crawler directives rather than an application fallback page.',
    recommendation: blocksAll
      ? 'Remove the site-wide disallow rule before launch if the website should be public.'
      : 'Serve a plain-text robots.txt file with a User-agent directive and the sitemap location.',
    url: robots?.url
  }));

  const sitemapContentType = sitemap?.headers?.['content-type'] ?? '';
  const sitemapLooksHtml = /html/i.test(sitemapContentType) || /^\s*(?:<!doctype\s+html|<html\b)/i.test(sitemap?.body ?? '');
  const validSitemap = sitemap?.status === 200
    && !sitemapLooksHtml
    && /<(?:urlset|sitemapindex)\b/i.test(sitemap.body);
  findings.push(finding({
    id: 'discoverability.sitemap',
    category: 'discoverability',
    title: 'XML sitemap',
    status: validSitemap ? 'pass' : sitemap?.status === 200 ? 'fail' : 'warning',
    severity: sitemap?.status === 200 && !validSitemap ? 'medium' : 'low',
    weight: sitemap?.status === 200 && !validSitemap ? 2 : 1,
    effort: 1,
    evidence: validSitemap
      ? `A valid XML sitemap was found at ${sitemap.url}.`
      : sitemap?.status === 200 && sitemapLooksHtml
        ? `The sitemap URL returned HTML (${sitemapContentType || 'unknown content type'}) instead of an XML sitemap.`
        : sitemap?.status === 200
          ? `The sitemap URL returned HTTP 200 but no urlset or sitemapindex element was found.`
      : sitemap?.error ?? `Sitemap candidate returned HTTP ${sitemap?.status ?? 'unknown'}.`,
    explanation: 'A sitemap helps search systems discover important URLs consistently.',
    recommendation: 'Publish a valid XML sitemap and reference it from robots.txt.',
    url: sitemap?.url
  }));

  const hasLocalSchema = schemaTypes.some(isLocalBusinessType);
  const hasBrokenJsonLd = jsonLd.some((item) => item.__parseError);
  findings.push(finding({
    id: 'local.schema',
    category: 'localRelevance',
    title: 'Local business structured data',
    status: hasLocalSchema ? 'pass' : hasBrokenJsonLd ? 'warning' : 'fail',
    severity: 'high',
    weight: 3,
    effort: 2,
    evidence: schemaTypes.length > 0
      ? `Detected schema types: ${schemaTypes.join(', ')}.`
      : hasBrokenJsonLd
        ? 'A JSON-LD block was found but could not be parsed.'
        : 'No JSON-LD schema types were detected.',
    explanation: 'Local business structured data provides explicit, machine-readable business context.',
    recommendation: 'Add valid LocalBusiness or a more specific schema type using only accurate public facts.',
    url
  }));

  findings.push(contextRule({
    id: 'local.service',
    title: 'Primary service visibility',
    key: 'service',
    value: context.service,
    text: visibleText,
    url,
    recommendation: `Mention the primary service${context.service ? ` “${context.service}”` : ''} clearly in the title, H1, or opening copy.`
  }));

  findings.push(contextRule({
    id: 'local.location',
    title: 'Primary location visibility',
    key: 'location',
    value: context.location,
    text: visibleText,
    url,
    recommendation: `Mention the primary location or service area${context.location ? ` “${context.location}”` : ''} where it helps visitors understand availability.`
  }));

  const hasPhone = /href\s*=\s*["']tel:/i.test(html) || /(?:\+?\d[\d\s().-]{7,}\d)/.test(visibleText);
  findings.push(finding({
    id: 'local.phone',
    category: 'localRelevance',
    title: 'Public phone number',
    status: hasPhone ? 'pass' : 'warning',
    severity: 'medium',
    weight: 2,
    effort: 1,
    evidence: hasPhone ? 'A public phone number or telephone link was detected.' : 'No public phone number was detected.',
    explanation: 'A visible phone number helps visitors verify and contact many local businesses.',
    recommendation: 'Add the public business phone number and use a telephone link on mobile.',
    url
  }));

  const schemaItems = jsonLd.flatMap(flattenJsonLd);
  const hasHours = /\b(?:mon|tue|wed|thu|fri|sat|sun)(?:day)?\b[\s\S]{0,50}\b\d{1,2}(?::\d{2})?\s*(?:am|pm)?/i.test(visibleText)
    || schemaItems.some((item) => item.openingHours || item.openingHoursSpecification);
  findings.push(finding({
    id: 'local.hours',
    category: 'localRelevance',
    title: 'Opening hours',
    status: hasHours ? 'pass' : 'warning',
    severity: 'low',
    weight: 1,
    effort: 1,
    evidence: hasHours ? 'Opening hours were detected.' : 'No opening hours were detected.',
    explanation: 'Hours help visitors decide when to call, book, or visit.',
    recommendation: 'Publish accurate opening or service hours when they apply to the business.',
    url
  }));

  const labels = interactiveLabels.join(' | ').toLowerCase();
  const phrases = goalPhrases(context.goal);
  const matchingPhrase = phrases.find((phrase) => labels.includes(phrase));
  findings.push(finding({
    id: 'conversion.primary-action',
    category: 'conversionReadiness',
    title: 'Clear primary action',
    status: matchingPhrase ? 'pass' : 'fail',
    severity: 'high',
    weight: 4,
    effort: 1,
    evidence: matchingPhrase
      ? `An interactive label contains “${matchingPhrase}”.`
      : `No interactive label matched the expected ${context.goal ?? 'local business'} action phrases.`,
    explanation: 'A specific action helps visitors move from interest to contact, booking, or purchase intent.',
    recommendation: `Add one prominent ${context.goal ?? 'contact'} action with a direct, descriptive label.`,
    url
  }));

  const hasConversionPath = /<form\b/i.test(html)
    || /href\s*=\s*["'](?:tel:|mailto:)/i.test(html)
    || /href\s*=\s*["'][^"']*(?:contact|book|reserv|appointment|quote|estimate)/i.test(html);
  findings.push(finding({
    id: 'conversion.path',
    category: 'conversionReadiness',
    title: 'Reachable conversion path',
    status: hasConversionPath ? 'pass' : 'fail',
    severity: 'high',
    weight: 4,
    effort: 2,
    evidence: hasConversionPath
      ? 'A form or direct contact, booking, or quote path was detected.'
      : 'No form or direct contact, booking, or quote path was detected.',
    explanation: 'A call to action must lead to a practical next step.',
    recommendation: 'Link the primary action to a working call, booking, contact, or quote path.',
    url
  }));

  findings.push(finding({
    id: 'conversion.mobile-viewport',
    category: 'conversionReadiness',
    title: 'Mobile viewport',
    status: /width\s*=\s*device-width/i.test(viewport) ? 'pass' : 'warning',
    severity: 'medium',
    weight: 2,
    effort: 1,
    evidence: viewport ? `Viewport: “${viewport}”.` : 'No viewport meta tag was found.',
    explanation: 'A responsive viewport is a basic requirement for usable mobile pages.',
    recommendation: 'Add a responsive viewport meta tag and verify the primary action on a small screen.',
    url
  }));

  const primaryHeading = headings[0] ?? '';
  const hasSpecificHeading = primaryHeading.length >= 12 && !/^(home|welcome|hello|we are)$/i.test(primaryHeading.trim());
  findings.push(finding({
    id: 'conversion.value-proposition',
    category: 'conversionReadiness',
    title: 'Clear opening value proposition',
    status: hasSpecificHeading ? 'pass' : 'warning',
    severity: 'medium',
    weight: 2,
    effort: 1,
    evidence: primaryHeading ? `Primary heading: “${primaryHeading}”.` : 'No primary heading was available to evaluate.',
    explanation: 'The opening message should quickly state what the business offers and for whom.',
    recommendation: 'Use the opening heading to communicate the service, customer, location, or differentiator.',
    url
  }));

  const trustMatches = visibleText.match(/\b(review|testimonial|rated|rating|licensed|insured|certified|guarantee|years? of experience)\b/gi) ?? [];
  findings.push(finding({
    id: 'conversion.trust',
    category: 'conversionReadiness',
    title: 'Trust information',
    status: trustMatches.length > 0 ? 'pass' : 'warning',
    severity: 'low',
    weight: 1,
    effort: 2,
    evidence: trustMatches.length > 0
      ? `Detected trust language: ${[...new Set(trustMatches.map((item) => item.toLowerCase()))].join(', ')}.`
      : 'No common review, credential, guarantee, or experience language was detected.',
    explanation: 'Relevant proof can reduce uncertainty before a visitor contacts a local business.',
    recommendation: 'Add accurate reviews, credentials, process details, or guarantees that visitors can verify.',
    url
  }));

  if (snapshot.rendering?.status === 'required' || snapshot.rendering?.status === 'incomplete') {
    const renderedContentRuleIds = new Set([
      'discoverability.primary-heading',
      'local.schema',
      'local.service',
      'local.location',
      'local.phone',
      'local.hours',
      'conversion.primary-action',
      'conversion.path',
      'conversion.value-proposition',
      'conversion.trust'
    ]);

    return findings.map((item) => renderedContentRuleIds.has(item.id)
      ? {
          ...item,
          status: 'not-applicable',
          evidence: snapshot.rendering.evidence,
          explanation: 'This rule depends on rendered page content that was not available to the static audit.',
          recommendation: 'Run the audit with --render after installing Playwright.'
        }
      : item);
  }

  return findings;
}

export function scoreFindings(findings) {
  const scores = {};

  for (const category of Object.keys(CATEGORY_LABELS)) {
    const categoryFindings = findings.filter((item) => item.category === category);
    const applicable = findings.filter((item) => item.category === category && item.status !== 'not-applicable');
    const totalWeight = categoryFindings.reduce((sum, item) => sum + item.weight, 0);
    const possible = applicable.reduce((sum, item) => sum + item.weight, 0);
    const earned = applicable.reduce((sum, item) => {
      if (item.status === 'pass') return sum + item.weight;
      if (item.status === 'warning') return sum + item.weight * 0.5;
      return sum;
    }, 0);
    const coverage = totalWeight === 0 ? 0 : possible / totalWeight;
    scores[category] = possible === 0 || coverage < 0.5 ? null : Math.round((earned / possible) * 100);
  }

  return scores;
}

export function scoreCoverage(findings) {
  const coverage = {};

  for (const category of Object.keys(CATEGORY_LABELS)) {
    const categoryFindings = findings.filter((item) => item.category === category);
    const totalWeight = categoryFindings.reduce((sum, item) => sum + item.weight, 0);
    const applicableWeight = categoryFindings
      .filter((item) => item.status !== 'not-applicable')
      .reduce((sum, item) => sum + item.weight, 0);
    coverage[category] = totalWeight === 0 ? 0 : Math.round((applicableWeight / totalWeight) * 100);
  }

  return coverage;
}

export function selectTopActions(findings, limit = 3) {
  const severityScore = { critical: 5, high: 4, medium: 2, low: 1 };
  const statusScore = { fail: 2, warning: 1 };

  return findings
    .filter((item) => item.status === 'fail' || item.status === 'warning')
    .map((item) => ({
      ...item,
      priorityScore: statusScore[item.status] * severityScore[item.severity] * item.weight / Math.max(item.effort, 1)
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore || a.id.localeCompare(b.id))
    .slice(0, limit)
    .map(({ priorityScore, ...item }) => item);
}

export { CATEGORY_LABELS };
