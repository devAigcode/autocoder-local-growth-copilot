import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { buildSnapshot, evaluateLaunchCheck, scoreCoverage, scoreFindings, selectTopActions } from '../src/rules.js';

test('Juniper Brick rendered baseline remains reproducible', async () => {
  const html = await readFile(new URL('./fixtures/juniper-brick-rendered-before.html', import.meta.url), 'utf8');
  const fallback = await readFile(new URL('./fixtures/juniper-brick-shell.html', import.meta.url), 'utf8');
  const homepage = {
    url: 'https://juniperbrick.autocoder.store/',
    status: 200,
    body: html,
    headers: { 'content-type': 'text/html' }
  };
  const fallbackResource = (path) => ({
    url: `https://juniperbrick.autocoder.store/${path}`,
    status: 200,
    body: fallback,
    headers: { 'content-type': 'text/html' }
  });
  const findings = evaluateLaunchCheck(buildSnapshot({
    html,
    homepage,
    robots: fallbackResource('robots.txt'),
    sitemap: fallbackResource('sitemap.xml'),
    context: {
      businessName: 'Juniper Brick',
      service: 'farm-to-table restaurant',
      location: 'Buffalo',
      goal: 'booking'
    },
    rendering: { status: 'rendered', evidence: 'Stored rendered fixture.' }
  }));

  assert.deepEqual(scoreFindings(findings), {
    discoverability: 50,
    localRelevance: 75,
    conversionReadiness: 65
  });
  assert.deepEqual(scoreCoverage(findings), {
    discoverability: 100,
    localRelevance: 100,
    conversionReadiness: 100
  });
  assert.deepEqual(selectTopActions(findings).map((item) => item.id), [
    'conversion.primary-action',
    'discoverability.title',
    'local.schema'
  ]);
});

test('Juniper Brick rendered after state remains reproducible', async () => {
  const html = await readFile(new URL('./fixtures/juniper-brick-rendered-after.html', import.meta.url), 'utf8');
  const fallback = await readFile(new URL('./fixtures/juniper-brick-shell.html', import.meta.url), 'utf8');
  const homepage = {
    url: 'https://juniperbrick.autocoder.store/',
    status: 200,
    body: html,
    headers: { 'content-type': 'text/html' }
  };
  const fallbackResource = (path) => ({
    url: `https://juniperbrick.autocoder.store/${path}`,
    status: 200,
    body: fallback,
    headers: { 'content-type': 'text/html' }
  });
  const findings = evaluateLaunchCheck(buildSnapshot({
    html,
    homepage,
    robots: fallbackResource('robots.txt'),
    sitemap: fallbackResource('sitemap.xml'),
    context: {
      businessName: 'Juniper Brick',
      service: 'farm-to-table restaurant',
      location: 'Buffalo',
      goal: 'booking'
    },
    rendering: { status: 'rendered', evidence: 'Stored rendered fixture.' }
  }));

  assert.deepEqual(scoreFindings(findings), {
    discoverability: 50,
    localRelevance: 100,
    conversionReadiness: 100
  });
  assert.deepEqual(selectTopActions(findings).map((item) => item.id), [
    'discoverability.title',
    'discoverability.canonical',
    'discoverability.meta-description'
  ]);
});
