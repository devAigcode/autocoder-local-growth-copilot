import assert from 'node:assert/strict';
import test from 'node:test';

import {
  findTagContents,
  getInteractiveLabels,
  getJsonLd,
  getLinkHref,
  getMetaContent,
  getVisibleText,
  parseAttributes
} from '../src/html.js';

const HTML = `<!doctype html>
<html>
  <head>
    <title>Buffalo Family Plumbing &amp; Heating</title>
    <meta content="Emergency plumbing in Buffalo for homes and businesses." name="description">
    <link href="https://example.test/" rel="canonical alternate">
    <script type="application/ld+json">
      {"@context":"https://schema.org","@type":"Plumber","name":"Buffalo Family Plumbing"}
    </script>
    <style>.hidden { display: none }</style>
  </head>
  <body>
    <h1>24/7 Plumbing in Buffalo</h1>
    <a href="/quote"><span>Request a Quote</span></a>
    <script>window.secret = "not visible";</script>
  </body>
</html>`;

test('parseAttributes handles attributes in any order', () => {
  assert.deepEqual(parseAttributes('<meta content="hello" name="description">'), {
    content: 'hello',
    name: 'description'
  });
});

test('HTML helpers extract metadata and visible content', () => {
  assert.equal(findTagContents(HTML, 'title')[0], 'Buffalo Family Plumbing & Heating');
  assert.equal(getMetaContent(HTML, 'name', 'description'), 'Emergency plumbing in Buffalo for homes and businesses.');
  assert.equal(getLinkHref(HTML, 'canonical'), 'https://example.test/');
  assert.deepEqual(getInteractiveLabels(HTML), ['Request a Quote']);
  assert.match(getVisibleText(HTML), /24\/7 Plumbing in Buffalo/);
  assert.doesNotMatch(getVisibleText(HTML), /window\.secret/);
});

test('getJsonLd parses structured data', () => {
  assert.equal(getJsonLd(HTML)[0]['@type'], 'Plumber');
});
