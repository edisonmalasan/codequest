import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => { await request.post('/__mock-reset'); });

test('E06 lost response retries without duplicate reward and version rejection preserves immutable input', async ({ request }, info) => {
  const snapshot = { event: 'retry-fixture', owner: 'account-B', quest: 'Q01', source: 'console.log("Ready for CodeQuest")', contentVersion: '1', assessmentVersion: '1', passed: true };
  let responseLost = false;
  try { await request.post('/__mock', { headers: { 'X-Mock-Owner': 'account-B', 'X-Mock-Lose-Response': '1' }, data: snapshot, maxRetries: 0 }); }
  catch { responseLost = true; }
  expect(responseLost).toBe(true);
  const retry = await request.post('/__mock', { headers: { 'X-Mock-Owner': 'account-B' }, data: snapshot });
  const receipt: unknown = await retry.json();
  expect(receipt).toMatchObject({ status: 'duplicate', simulatedReward: false });
  const retired = { ...snapshot, assessmentVersion: 'retired' };
  const rejected = await request.post('/__mock', { headers: { 'X-Mock-Owner': 'account-B' }, data: retired });
  expect(await rejected.json()).toMatchObject({ status: 'retry-required', simulatedReward: false });
  expect(retired.source).toBe(snapshot.source);
  await info.attach('mock-reconciliation', { body: JSON.stringify({ responseLost, receipt, retiredInputPreserved: retired, productionAuthorization: false }), contentType: 'application/json' });
});
