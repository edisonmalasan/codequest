import { expect, test } from '@playwright/test';

test('login and registration routes expose keyboard-usable authentication controls', async ({
  page,
}) => {
  await page.goto('/login?next=%2Faccount');
  await expect(
    page.getByRole('heading', { name: 'Resume your quest' }),
  ).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('link', { name: 'CodeQuest home' }),
  ).toBeFocused();
  await page.getByLabel('Email').fill('learner@example.test');
  await page.getByLabel('Password').fill('password123');
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Google' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'GitHub' })).toBeVisible();

  await page.goto('/register');
  await expect(
    page.getByRole('heading', { name: 'Create your player ID' }),
  ).toBeVisible();
  await expect(page.getByLabel('Password')).toHaveAttribute(
    'autocomplete',
    'new-password',
  );
});

test('callback failure and protected account routing recover without leaking values', async ({
  page,
}) => {
  await page.goto(
    '/auth/callback?next=https://attacker.test&token=private-value',
  );
  await expect(page).toHaveURL(/\/login\?error=callback$/);
  await expect(
    page.getByText('Authentication could not be completed. Please try again.'),
  ).toBeVisible();
  await expect(page.locator('body')).not.toContainText('private-value');

  await page.goto('/account');
  await expect(page).toHaveURL(/\/login\?next=%2Faccount$/);
});
