const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const ts = require('typescript');
function loadRoute(file, db, fetch = async () => ({ ok: true }), env = { ZOOPLANET_WEBHOOK_TOKEN: 'test-only' }) {
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(code, {
    module, exports: module.exports, Request, URL, Date, Buffer, AbortSignal, fetch, process: { env },
    require(name) {
      if (name === 'next/server') return { NextResponse: { json: (data, init) => Response.json(data, init) } };
      if (name === '@/lib/server-supabase') return { EVENT_ID: 'sfilata-cuccioli-2026-10-17', getServerSupabase: () => db };
      return require(name);
    },
  });
  return module.exports;
}
const valid = { first_name: ' Test ', last_name: ' Funnel ', city: ' Milano ', email: 'TEST@Example.com', phone: '0000000000', dog_breed: ' Meticcio ', participants: 2, privacy_accepted: true, referred_by: null };
const request = data => new Request('https://example.com/api/registrations', { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
function insertDb(result, capture) { return { from: () => ({ insert(data) { capture.data = data; return { select: () => ({ single: async () => result }) }; } }) }; }
test('valid registration normalizes data, fixes event and time, sends only saved data', async () => {
  const capture = {};
  const db = insertDb({ data: { id: 'saved-id', email: 'test@example.com', referral_code: 'a'.repeat(32) } }, capture);
  let sent;
  const route = loadRoute('app/api/registrations/route.ts', db, async (url, init) => { sent = JSON.parse(init.body); return { ok: true }; });
  const response = await route.POST(request({ ...valid, time_slot: '10:00', event_id: 'other', registration_id: 'forged' }));
  assert.equal(response.status, 201);
  assert.equal(capture.data.email, 'test@example.com');
  assert.equal(capture.data.dog_breed, 'Meticcio');
  assert.equal(capture.data.event_id, 'sfilata-cuccioli-2026-10-17');
  assert.equal(capture.data.time_slot, '15:00 - 18:00');
  assert.equal(sent.registration_id, 'saved-id');
  assert.equal((await response.json()).email_accepted, true);
});
test('missing breed, consent and invalid participant count never reach database', async () => {
  const route = loadRoute('app/api/registrations/route.ts', { from() { throw Error('must not write'); } });
  for (const data of [{ ...valid, dog_breed: ' ' }, { ...valid, privacy_accepted: false }, { ...valid, participants: 9 }, { ...valid, referred_by: 'invalid-code' }]) {
    assert.equal((await route.POST(request(data))).status, 400);
  }
});
test('duplicate email returns conflict and sends no email', async () => {
  const route = loadRoute('app/api/registrations/route.ts', insertDb({ error: { code: '23505' } }, {}), async () => { throw Error('must not send'); });
  assert.equal((await route.POST(request(valid))).status, 409);
});
test('mail outage preserves successful registration with pending mail state', async () => {
  const route = loadRoute('app/api/registrations/route.ts', insertDb({ data: { id: 'saved-id', referral_code: 'a'.repeat(32) } }, {}), async () => { throw Error('offline'); });
  const response = await route.POST(request(valid));
  assert.equal(response.status, 201);
  assert.equal((await response.json()).email_accepted, false);
});
test('missing service configuration rejects before saving', async () => {
  const route = loadRoute('app/api/registrations/route.ts', { from() { throw Error('must not write'); } }, undefined, {});
  assert.equal((await route.POST(request(valid))).status, 503);
});
test('referral endpoint returns only count and scopes to current event', async () => {
  const filters = [];
  const query = { eq(k,v) { filters.push([k,v]); return this; }, maybeSingle: async () => ({ data: { referral_count: 2 } }) };
  const db = { from: () => ({ select: field => { assert.equal(field, 'referral_count'); return query; } }) };
  const route = loadRoute('app/api/referrals/route.ts', db);
  const response = await route.GET(new Request('https://example.com/api/referrals?code=' + 'a'.repeat(32)));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { referral_count: 2 });
  assert.equal(filters[0][1], 'sfilata-cuccioli-2026-10-17');
  assert.equal((await route.GET(new Request('https://example.com/api/referrals?code=bad'))).status, 400);
});
test('retry endpoint rejects missing or wrong token before accessing contacts', async () => {
  const route = loadRoute('app/api/confirmations/retry/route.ts', { from() { throw Error('must not read'); } });
  for (const token of ['', 'wrong']) {
    const request = new Request('https://example.com/api/confirmations/retry', { method: 'POST', headers: { 'x-webhook-token': token } });
    assert.equal((await route.POST(request)).status, 401);
  }
});
test('retry leases pending confirmations and skips already claimed messages', async () => {
  let phase = 'read'; let leased = 0; let sent = 0; const filters = [];
  const rows = [{ id: 'first', email: 'first@example.com' }, { id: 'already-claimed', email: 'second@example.com' }];
  const query = {
    eq(k,v) { filters.push([k,v]); return this; }, is() { return this; }, lt() { return this; }, or() { return this; }, order() { return this; },
    limit: async () => ({ data: rows }), select() { return this; },
    maybeSingle: async () => ({ data: leased++ === 0 ? { id: 'first' } : null }),
  };
  const db = { from: () => ({ select() { phase = 'read'; return query; }, update() { phase = 'lease'; return query; } }) };
  const route = loadRoute('app/api/confirmations/retry/route.ts', db, async (url, init) => {
    assert.equal(phase, 'lease'); assert.equal(JSON.parse(init.body).registration_id, 'first'); sent++; return { ok: true };
  });
  const response = await route.POST(new Request('https://example.com/api/confirmations/retry', { method: 'POST', headers: { 'x-webhook-token': 'test-only' } }));
  assert.equal(response.status, 200); assert.equal(sent, 1);
  assert.deepEqual(await response.json(), { pending: 2, accepted: 1 });
  assert.equal(filters[0][1], 'sfilata-cuccioli-2026-10-17');
});
