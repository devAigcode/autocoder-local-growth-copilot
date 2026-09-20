import assert from 'node:assert/strict';
import test from 'node:test';

import { parseArguments } from '../src/cli.js';

test('parseArguments accepts browser rendering mode', () => {
  const parsed = parseArguments(['https://example.test', '--render', '--goal', 'booking']);
  assert.equal(parsed.url, 'https://example.test');
  assert.equal(parsed.options.render, true);
  assert.equal(parsed.options.goal, 'booking');
});
