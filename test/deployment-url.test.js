import test from 'node:test';
import assert from 'node:assert/strict';
import { deploymentUrl } from '../scripts/deployment-url.mjs';

test('reads nested Vercel result and prefers production alias', () => {
  assert.equal(deploymentUrl({ status: 'ok', deployment: { readyState: 'READY', productionUrl: 'https://demo.vercel.app', url: 'https://demo-123.vercel.app' } }), 'https://demo.vercel.app/');
});
test('reads flat CLI result with schemeless URL', () => {
  assert.equal(deploymentUrl({ url: 'demo-preview.vercel.app', readyState: 'BUILDING' }), 'https://demo-preview.vercel.app/');
});
test('does not require transient CLI readiness before HTTP health verification', () => {
  assert.equal(deploymentUrl({ status: 'ok', deployment: { url: 'https://demo-preview.vercel.app' } }), 'https://demo-preview.vercel.app/');
});
test('rejects error, missing URL and unexpected host', () => {
  for (const response of [{ error: 'failed' }, {}, { url: 'example.com' }]) {
    assert.throws(() => deploymentUrl(response));
  }
});
