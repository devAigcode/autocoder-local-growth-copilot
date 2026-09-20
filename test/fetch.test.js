import assert from 'node:assert/strict';
import test from 'node:test';

import { isPrivateAddress, normalizeUrl } from '../src/fetch.js';

test('normalizeUrl accepts public HTTP URLs and removes fragments', () => {
  assert.equal(normalizeUrl('https://example.com/page#details').toString(), 'https://example.com/page');
});

test('normalizeUrl rejects credentials and unsupported protocols', () => {
  assert.throws(() => normalizeUrl('https://user:secret@example.com'), /credentials/);
  assert.throws(() => normalizeUrl('file:///tmp/example.html'), /Only HTTP and HTTPS/);
});

test('private and reserved addresses are rejected', () => {
  assert.equal(isPrivateAddress('127.0.0.1'), true);
  assert.equal(isPrivateAddress('10.1.2.3'), true);
  assert.equal(isPrivateAddress('192.168.1.2'), true);
  assert.equal(isPrivateAddress('169.254.1.1'), true);
  assert.equal(isPrivateAddress('::1'), true);
  assert.equal(isPrivateAddress('fd00::1'), true);
  assert.equal(isPrivateAddress('93.184.216.34'), false);
  assert.equal(isPrivateAddress('2606:2800:220:1:248:1893:25c8:1946'), false);
});
