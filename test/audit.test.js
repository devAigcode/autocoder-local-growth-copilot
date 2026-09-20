import assert from 'node:assert/strict';
import test from 'node:test';

import { auditSite } from '../src/audit.js';
import { renderJson, renderMarkdown } from '../src/report.js';

const HTML = `<!doctype html>
<html>
  <head>
    <title>Emergency Plumbing in Buffalo | North Star Plumbing</title>
    <meta name="description" content="Buffalo plumbing repairs, drain cleaning, and water heater service from a licensed local team. Request a clear quote for fast, reliable help today.">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="canonical" href="https://example.test/">
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"Plumber","openingHours":"Mo-Su"}</script>
  </head>
  <body>
    <h1>Emergency Plumbing in Buffalo</h1>
    <p>Licensed and insured service. Call +1 716 555 0100.</p>
    <a href="/quote">Request a Quote</a>
  </body>
</html>`;

function mockFetcher(input) {
  const url = new URL(input);
  if (url.pathname === '/robots.txt') {
    return Promise.resolve({
      url: url.toString(),
      status: 200,
      body: 'User-agent: *\nAllow: /\nSitemap: https://example.test/custom-sitemap.xml',
      headers: { 'content-type': 'text/plain' }
    });
  }
  if (url.pathname === '/custom-sitemap.xml') {
    return Promise.resolve({
      url: url.toString(),
      status: 200,
      body: '<?xml version="1.0"?><urlset></urlset>',
      headers: { 'content-type': 'application/xml' }
    });
  }
  return Promise.resolve({
    url: url.toString(),
    status: 200,
    body: HTML,
    headers: { 'content-type': 'text/html; charset=utf-8' }
  });
}

test('auditSite returns a complete, serializable report', async () => {
  const report = await auditSite('https://example.test/', {
    fetcher: mockFetcher,
    context: { businessName: 'North Star Plumbing', service: 'plumbing', location: 'Buffalo', goal: 'quote' }
  });

  assert.equal(report.schemaVersion, '1.0');
  assert.equal(report.inspectedResources.length, 3);
  assert.equal(report.inspectedResources[2].url, 'https://example.test/custom-sitemap.xml');
  assert.equal(report.topActions.length <= 3, true);
  assert.doesNotThrow(() => JSON.parse(renderJson(report)));
  assert.match(renderMarkdown(report), /# Launch Check/);
  assert.match(renderMarkdown(report), /## Scores/);
});

test('auditSite rejects an unsuccessful homepage response', async () => {
  await assert.rejects(
    auditSite('https://example.test/missing', {
      fetcher: async (input) => ({
        url: new URL(input).toString(),
        status: 404,
        body: 'Not found',
        headers: { 'content-type': 'text/plain' }
      })
    }),
    /Homepage returned HTTP 404/
  );
});
