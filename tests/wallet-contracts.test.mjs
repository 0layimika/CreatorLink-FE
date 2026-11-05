import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const nodeRequire = createRequire(import.meta.url);
const testDirectory = path.dirname(fileURLToPath(import.meta.url));

// Exercise the actual TypeScript modules without adding a test framework.
function loadModule(relativePath, overrides = {}, globals = {}) {
  const filename = path.resolve(testDirectory, '..', relativePath);
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: filename,
  }).outputText;
  const exports = {};
  const context = {
    exports, process, URLSearchParams, FormData, AbortController,
    require(name) {
      if (name in overrides) return overrides[name];
      if (name.startsWith('@/')) return loadModule(`${name.slice(2)}.ts`, overrides, globals);
      return nodeRequire(name);
    },
    ...globals,
  };
  vm.runInNewContext(output, context, { filename });
  return exports;
}

function apiWithFetch(fetch) {
  return loadModule('lib/api.ts', {}, { fetch });
}

const response = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

test('money input rejects extra precision and malformed amounts', () => {
  const { validMoneyAmount, isMoneyInput } = loadModule('lib/money.ts');
  for (const value of ['1.001', '1.2.3', 'NaN', 'Infinity', '1e3', '-1', '', '.', '0']) assert.equal(validMoneyAmount(value), null, value);
  assert.equal(validMoneyAmount('100000.00'), 100000);
  assert.equal(validMoneyAmount('0.01'), 0.01);
  assert.equal(isMoneyInput('1.001'), false);
  assert.equal(isMoneyInput('1.'), true);
});

test('decimal strings format in their own currency, retaining kobo and cents', () => {
  const { formatCurrency } = loadModule('lib/utils.ts');
  assert.equal(formatCurrency('10000.25', 'NGN'), '₦10,000.25');
  assert.equal(formatCurrency('9.80', 'USD'), 'US$9.80');
});

test('fee rows remain debits and retain their source metadata', () => {
  const { mapTransaction, isCredit } = loadModule('lib/money.ts');
  const mapped = mapTransaction({ id: 2, type: 'fee', amount: '200.00', currency: 'NGN', status: 'pending', metadata: { gift_transaction_id: 1 }, created_at: '2026-11-01T00:00:00Z' });
  assert.equal(mapped.type, 'fee');
  assert.equal(mapped.amount, 200);
  assert.equal(mapped.metadata.gift_transaction_id, 1);
  assert.equal(isCredit(mapped.type), false);
  assert.equal(isCredit('payment'), true);
});

test('admin debit rows display as debits in creator history', () => {
  const { mapTransaction, isCredit } = loadModule('lib/money.ts');
  const mapped = mapTransaction({ id: 12, type: 'admin_debit', amount: '4.25', currency: 'USD', status: 'completed', metadata: { reason: 'Correction' }, created_at: '2026-11-05T00:00:00Z' });
  assert.equal(mapped.type, 'admin_debit');
  assert.equal(mapped.amount, 4.25);
  assert.equal(isCredit(mapped.type), false);
});

test('admin debits preserve decimal strings and retry IDs; list filters are encoded', async () => {
  const requests = [];
  const { api } = apiWithFetch(async (url, options) => {
    requests.push({ url: new URL(url), method: options.method, body: options.body ? JSON.parse(options.body) : undefined });
    return response({ success: true, data: {} });
  });
  const { adminApi } = loadModule('lib/admin-api.ts', { './api': { api } });
  const body = { amount: '1.20', reason: 'Correction', request_id: 'b6f5cfcb-ef68-474e-8646-a56d18b1a3c5' };
  await adminApi.debit(9, body);
  await adminApi.debit(9, body);
  assert.deepEqual(requests[0].body, body);
  assert.deepEqual(requests[1].body, body);
  assert.equal(requests[0].url.pathname, '/api/v1/admin/wallets/9/debit');
  await adminApi.transactions({ search: 'name&currency=NGN', currency: 'USD', offset: 0, limit: 25 });
  assert.equal(requests[2].url.searchParams.get('search'), 'name&currency=NGN');
  assert.deepEqual(requests[2].url.searchParams.getAll('currency'), ['USD']);
  assert.equal(requests[2].url.searchParams.get('offset'), '0');
});

test('withdrawals quote in major units and execute with only quote ID and password', async () => {
  const requests = [];
  const { walletApi } = apiWithFetch(async (url, options) => {
    requests.push({ url, body: JSON.parse(options.body) });
    return response({ success: true, data: {} });
  });
  await walletApi.quoteWithdrawal(10.25, 'USD');
  await walletApi.withdraw('wq_original', 'test-password');
  assert.deepEqual(requests[0].body, { amount: 10.25, currency: 'USD' });
  assert.deepEqual(requests[1].body, { quote_id: 'wq_original', password: 'test-password' });
});

test('HTTP 200 failed payout remains a failed payout, not request success alone', async () => {
  const { walletApi } = apiWithFetch(async () => response({ success: true, data: { status: 'failed' } }));
  const result = await walletApi.withdraw('wq_original', 'test-password');
  assert.equal(result.data.status, 'failed');
});

test('business errors expose backend error.message and HTTP status', async () => {
  const { giftApi, ApiError } = apiWithFetch(async () => response({ success: false, error: { code: 'BAD_REQUEST', message: 'Maximum gift amount is 100 USD' } }, 400));
  await assert.rejects(giftApi.sendGift({ creatorUsername: 'creator', currency: 'USD', amount: 101, sender_email: 'test@example.com' }), error => error instanceof ApiError && error.status === 400 && error.message === 'Maximum gift amount is 100 USD');
});

test('history uses type, limit and offset, including zero values', async () => {
  const requests = [];
  const { walletApi } = apiWithFetch(async url => { requests.push(new URL(url)); return response({ success: true, data: [] }); });
  await walletApi.getTransactions({ type: 'fee', limit: 0, offset: 0 });
  await walletApi.getWithdrawals({ limit: 50, offset: 50 });
  assert.equal(requests[0].searchParams.get('type'), 'fee');
  assert.equal(requests[0].searchParams.get('limit'), '0');
  assert.equal(requests[0].searchParams.get('offset'), '0');
  assert.equal(requests[0].searchParams.has('page'), false);
  assert.equal(requests[1].searchParams.get('offset'), '50');
});

test('uncertain withdrawal recovery scans mixed-currency pages for the original quote', async () => {
  const offsets = [];
  const { findWithdrawal } = loadModule('lib/withdrawals.ts', {
    '@/lib/api': { walletApi: { getWithdrawals: async ({ offset }) => {
      offsets.push(offset);
      return { data: offset === 0 ? Array.from({ length: 50 }, (_, index) => ({ id: index, currency: 'USD', reference: `other_${index}`, metadata: {} })) : [{ id: 99, currency: 'NGN', reference: 'withdraw_original', metadata: { quote_id: 'wq_original' }, status: 'pending' }] };
    } } },
  });
  const match = await findWithdrawal({ quote_id: 'wq_original' });
  assert.equal(match.reference, 'withdraw_original');
  assert.deepEqual(offsets, [0, 50]);
});

test('absence from history leaves an uncertain withdrawal unresolved', async () => {
  const { findWithdrawal } = loadModule('lib/withdrawals.ts', { '@/lib/api': { walletApi: { getWithdrawals: async () => ({ data: [] }) } } });
  assert.equal(await findWithdrawal({ quote_id: 'wq_original' }), undefined);
});

test('quote submission reserves two full seconds and rejects invalid expiry timestamps', () => {
  const { quoteIsCurrent } = loadModule('lib/withdrawals.ts', { '@/lib/api': {} });
  const now = Date.parse('2026-11-01T12:00:00.000Z');
  assert.equal(quoteIsCurrent('2026-11-01T12:00:02.001Z', now), true);
  assert.equal(quoteIsCurrent('2026-11-01T12:00:02.000Z', now), false);
  assert.equal(quoteIsCurrent('2026-11-01T11:59:59.000Z', now), false);
  assert.equal(quoteIsCurrent('invalid', now), false);
});

test('gift verification preserves and encodes the supplied merchant reference', async () => {
  let requested;
  const { giftApi } = apiWithFetch(async url => { requested = new URL(url); return response({ success: true, data: { status: 'pending' } }); });
  await giftApi.verifyGift('gift_original&reference=chk_wrong');
  assert.equal(requested.searchParams.get('reference'), 'gift_original&reference=chk_wrong');
  assert.equal(requested.searchParams.getAll('reference').length, 1);
});
