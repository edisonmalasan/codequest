import type { Page } from '@playwright/test';

const secureFixtureOrigin = 'https://127.0.0.1:54321';
const localFixtureOrigin = 'http://127.0.0.1:54321';

export async function routeSyntheticAuthToLocalFixture(
  page: Page,
): Promise<void> {
  await page.route(`${secureFixtureOrigin}/**`, async (route) => {
    const target = route
      .request()
      .url()
      .replace(secureFixtureOrigin, localFixtureOrigin);
    const response = await route.fetch({ url: target });
    await route.fulfill({ response });
  });
}
