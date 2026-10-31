import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

test('Vercel CDN & Cache-Control Configuration Verification', async (t) => {
  const vercelJsonPath = path.resolve(process.cwd(), 'vercel.json');
  assert.ok(fs.existsSync(vercelJsonPath), 'vercel.json must exist in project root');

  const config = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));

  await t.test('1. SPA rewrites must be preserved', () => {
    assert.ok(Array.isArray(config.rewrites), 'rewrites must be an array');
    const spaRewrite = config.rewrites.find(
      (r) => (r.source === '/(.*)' || r.source === '/:match*') && r.destination === '/index.html'
    );
    assert.ok(spaRewrite, 'must contain catch-all SPA rewrite to /index.html');
  });

  await t.test('2. Hashed static assets under /assets/ have immutable 1-year cache policy', () => {
    assert.ok(Array.isArray(config.headers), 'headers must be an array');
    const assetHeaderRule = config.headers.find((h) => h.source === '/assets/(.*)');
    assert.ok(assetHeaderRule, 'must define header rule for /assets/(.*)');

    const cacheHeader = assetHeaderRule.headers.find((kv) => kv.key === 'Cache-Control');
    assert.ok(cacheHeader, 'must define Cache-Control header for /assets/(.*)');
    assert.equal(cacheHeader.value, 'public, max-age=31536000, immutable');
  });

  await t.test('3. HTML has revalidation policy to discover new deployments immediately', () => {
    const htmlHeaderRule = config.headers.find((h) => h.source === '/index.html');
    assert.ok(htmlHeaderRule, 'must define header rule for /index.html');

    const cacheHeader = htmlHeaderRule.headers.find((kv) => kv.key === 'Cache-Control');
    assert.ok(cacheHeader, 'must define Cache-Control header for /index.html');
    assert.equal(cacheHeader.value, 'public, max-age=0, must-revalidate');

    // Root catch-all defaults to must-revalidate so HTML routes are never cached for 1 year
    const rootRule = config.headers.find((h) => h.source === '/(.*)');
    assert.ok(rootRule, 'must define default rule for /(.*)');
    const rootCache = rootRule.headers.find((kv) => kv.key === 'Cache-Control');
    assert.ok(rootCache, 'must define Cache-Control header for /(.*)');
    assert.equal(rootCache.value, 'public, max-age=0, must-revalidate');
  });

  await t.test('4. Unhashed images have safe short cache duration (1 day)', () => {
    const imgRule = config.headers.find((h) => h.source.includes('ico|png|jpg|jpeg|webp|svg|gif'));
    assert.ok(imgRule, 'must define header rule for unhashed image formats');

    const cacheHeader = imgRule.headers.find((kv) => kv.key === 'Cache-Control');
    assert.ok(cacheHeader, 'must define Cache-Control header for images');
    assert.equal(cacheHeader.value, 'public, max-age=86400');
  });

  await t.test('5. Font files have immutable 1-year cache policy', () => {
    const fontRule = config.headers.find((h) => h.source.includes('woff|woff2|ttf|otf|eot'));
    assert.ok(fontRule, 'must define header rule for font files');

    const cacheHeader = fontRule.headers.find((kv) => kv.key === 'Cache-Control');
    assert.ok(cacheHeader, 'must define Cache-Control header for fonts');
    assert.equal(cacheHeader.value, 'public, max-age=31536000, immutable');
  });

  await t.test('6. Security headers are defined without conflicts', () => {
    const rootRule = config.headers.find((h) => h.source === '/(.*)');
    assert.ok(rootRule, 'must define root rule for security headers');

    const headerKeys = rootRule.headers.map((h) => h.key);
    assert.ok(headerKeys.includes('X-Content-Type-Options'), 'must include X-Content-Type-Options');
    assert.ok(headerKeys.includes('X-Frame-Options'), 'must include X-Frame-Options');
    assert.ok(headerKeys.includes('Referrer-Policy'), 'must include Referrer-Policy');
  });
});
