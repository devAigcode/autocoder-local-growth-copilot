import assert from 'node:assert/strict';
import test from 'node:test';

import { buildSnapshot, evaluateLaunchCheck, scoreFindings, selectTopActions } from '../src/rules.js';

function resource(url, status, body = '', contentType) {
  const inferredType = url.endsWith('/robots.txt')
    ? 'text/plain'
    : url.endsWith('.xml')
      ? 'application/xml'
      : 'text/html';
  return { url, status, body, headers: { 'content-type': contentType ?? inferredType } };
}

const COMPLETE_HTML = `<!doctype html>
<html>
  <head>
    <title>Emergency Plumbing in Buffalo | North Star Plumbing</title>
    <meta name="description" content="Licensed Buffalo plumbers for emergency repairs, drain cleaning, and water heater service. Call today for a clear estimate and fast local help.">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="canonical" href="https://example.test/">
    <script type="application/ld+json">
      {"@context":"https://schema.org","@type":"Plumber","name":"North Star Plumbing","telephone":"+1 716 555 0100","openingHours":"Mo-Su 00:00-23:59"}
    </script>
  </head>
  <body>
    <h1>24/7 Emergency Plumbing in Buffalo</h1>
    <p>Licensed and insured plumbers with 20 years of experience.</p>
    <p>Monday-Sunday 24 hours. Call +1 716 555 0100.</p>
    <a href="tel:+17165550100">Call Now</a>
    <a href="/quote">Request a Quote</a>
  </body>
</html>`;

test('a well-formed local business page passes core checks', () => {
  const homepage = resource('https://example.test/', 200, COMPLETE_HTML);
  const robots = resource('https://example.test/robots.txt', 200, 'User-agent: *\nAllow: /\nSitemap: https://example.test/sitemap.xml');
  const sitemap = resource('https://example.test/sitemap.xml', 200, '<?xml version="1.0"?><urlset></urlset>');
  const snapshot = buildSnapshot({
    html: COMPLETE_HTML,
    homepage,
    robots,
    sitemap,
    context: { service: 'plumbing', location: 'Buffalo', goal: 'quote' }
  });
  const findings = evaluateLaunchCheck(snapshot);
  const scores = scoreFindings(findings);

  assert.equal(findings.find((item) => item.id === 'local.schema').status, 'pass');
  assert.equal(findings.find((item) => item.id === 'conversion.primary-action').status, 'pass');
  assert.ok(scores.discoverability >= 90);
  assert.ok(scores.localRelevance >= 90);
  assert.ok(scores.conversionReadiness >= 90);
});

test('missing fundamentals produce prioritized actions', () => {
  const html = '<html><head></head><body><h2>Welcome</h2></body></html>';
  const homepage = resource('https://example.test/', 200, html);
  const robots = resource('https://example.test/robots.txt', 404, '');
  const sitemap = resource('https://example.test/sitemap.xml', 404, '');
  const findings = evaluateLaunchCheck(buildSnapshot({
    html,
    homepage,
    robots,
    sitemap,
    context: { service: 'plumbing', location: 'Buffalo', goal: 'quote' }
  }));
  const actions = selectTopActions(findings);

  assert.equal(actions.length, 3);
  assert.ok(actions.every((item) => ['fail', 'warning'].includes(item.status)));
  assert.ok(actions.some((item) => item.id === 'conversion.primary-action'));
  assert.ok(scoreFindings(findings).discoverability < 50);
});

test('context-dependent checks are not applicable when context is omitted', () => {
  const homepage = resource('https://example.test/', 200, COMPLETE_HTML);
  const findings = evaluateLaunchCheck(buildSnapshot({
    html: COMPLETE_HTML,
    homepage,
    robots: resource('https://example.test/robots.txt', 200, 'User-agent: *\nAllow: /'),
    sitemap: resource('https://example.test/sitemap.xml', 200, '<urlset></urlset>'),
    context: {}
  }));

  assert.equal(findings.find((item) => item.id === 'local.service').status, 'not-applicable');
  assert.equal(findings.find((item) => item.id === 'local.location').status, 'not-applicable');
});

test('HTML fallback responses fail robots and sitemap validation', () => {
  const fallback = '<!doctype html><html><body><div id="root"></div><script src="/app.js"></script></body></html>';
  const homepage = resource('https://example.test/', 200, COMPLETE_HTML);
  const findings = evaluateLaunchCheck(buildSnapshot({
    html: COMPLETE_HTML,
    homepage,
    robots: resource('https://example.test/robots.txt', 200, fallback, 'text/html'),
    sitemap: resource('https://example.test/sitemap.xml', 200, fallback, 'text/html'),
    context: {}
  }));

  assert.equal(findings.find((item) => item.id === 'discoverability.robots').status, 'fail');
  assert.match(findings.find((item) => item.id === 'discoverability.robots').evidence, /returned HTML/);
  assert.equal(findings.find((item) => item.id === 'discoverability.sitemap').status, 'fail');
});

test('render-dependent checks become not applicable for an unrendered shell', () => {
  const homepage = resource('https://example.test/', 200, '<html></html>');
  const findings = evaluateLaunchCheck(buildSnapshot({
    html: '<html></html>',
    homepage,
    robots: resource('https://example.test/robots.txt', 200, 'User-agent: *\nAllow: /'),
    sitemap: resource('https://example.test/sitemap.xml', 200, '<urlset></urlset>'),
    context: { service: 'restaurant', location: 'Buffalo', goal: 'booking' },
    rendering: {
      status: 'required',
      evidence: 'A client-rendered shell was detected.'
    }
  }));

  assert.equal(findings.find((item) => item.id === 'discoverability.primary-heading').status, 'not-applicable');
  assert.equal(findings.find((item) => item.id === 'local.location').status, 'not-applicable');
  assert.equal(findings.find((item) => item.id === 'conversion.primary-action').status, 'not-applicable');
  assert.equal(findings.find((item) => item.id === 'discoverability.title').status, 'fail');
});

test('plural review language is recognized as trust information', () => {
  const html = '<html><head><title>Restaurant in Buffalo</title></head><body><h1>Seasonal dining in Buffalo</h1><h2>Guest Reviews</h2><a href="/book">Book a Table</a></body></html>';
  const homepage = resource('https://example.test/', 200, html);
  const findings = evaluateLaunchCheck(buildSnapshot({
    html,
    homepage,
    robots: resource('https://example.test/robots.txt', 200, 'User-agent: *\nAllow: /'),
    sitemap: resource('https://example.test/sitemap.xml', 200, '<urlset></urlset>'),
    context: { goal: 'booking' }
  }));

  assert.equal(findings.find((item) => item.id === 'conversion.trust').status, 'pass');
});
