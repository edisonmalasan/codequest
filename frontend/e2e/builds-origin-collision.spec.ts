import { expect, test } from '@playwright/test';

test('Build route fails closed when the runner origin collides with the app', async ({
  request,
}) => {
  const response = await request.get('/builds');
  expect(response.status()).toBe(404);
  expect(await response.text()).not.toContain('New Build');
});
