import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, '../../../..');
const requireFromFrontend = createRequire(
  path.join(repositoryRoot, 'frontend/package.json'),
);
const { chromium } = requireFromFrontend('@playwright/test');

const baseUrl = process.env.CODEQUEST_SHOWCASE_URL ?? 'http://127.0.0.1:4320';
const chromePath =
  process.env.CODEQUEST_CHROME_PATH ??
  'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await chromium.launch({ executablePath: chromePath });
const result = {
  timestamp: new Date().toISOString(),
  browser: 'Installed Google Chrome',
  version: await browser.version(),
  checks: [],
  consoleErrors: [],
  pageErrors: [],
  requestFailures: [],
  badResponses: [],
};

function check(name, passed, details = {}) {
  result.checks.push({
    name,
    result: passed ? 'passed' : 'failed',
    ...details,
  });
  if (!passed) process.exitCode = 1;
}

async function openShowcase(page) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await page.goto(`${baseUrl}/design-system`, {
      waitUntil: 'networkidle',
    });
    if (response?.status() === 200) return response;
    await page.waitForTimeout(1_000);
  }
  throw new Error('Showcase did not return 200 after one retry');
}

async function auditViewport(viewport, name) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  page.on('console', (message) => {
    if (message.type() === 'error') {
      result.consoleErrors.push({ viewport: name, text: message.text() });
    }
  });
  page.on('pageerror', (error) =>
    result.pageErrors.push({ viewport: name, text: error.message }),
  );
  page.on('requestfailed', (request) =>
    result.requestFailures.push({
      viewport: name,
      url: request.url(),
      error: request.failure()?.errorText,
    }),
  );
  page.on('response', (response) => {
    if (response.status() >= 400) {
      result.badResponses.push({
        viewport: name,
        url: response.url(),
        status: response.status(),
      });
    }
  });

  const response = await openShowcase(page);
  check(`${name}: route responds`, response.status() === 200, {
    httpStatus: response.status(),
  });
  check(
    `${name}: identity heading`,
    await page
      .getByRole('heading', { name: 'Build a path through code.' })
      .isVisible(),
  );

  const brokenImages = await page
    .locator('img')
    .evaluateAll((images) =>
      images
        .filter((image) => !image.complete || image.naturalWidth === 0)
        .map((image) => image.getAttribute('src')),
    );
  check(`${name}: all images load`, brokenImages.length === 0, {
    broken: brokenImages,
  });

  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  check(
    `${name}: no horizontal overflow`,
    overflow.scrollWidth <= overflow.innerWidth,
    overflow,
  );

  const smallTargets = await page
    .locator('button:visible')
    .evaluateAll((buttons) =>
      buttons
        .map((button) => {
          const bounds = button.getBoundingClientRect();
          return {
            text: button.textContent?.trim().slice(0, 40),
            width: bounds.width,
            height: bounds.height,
          };
        })
        .filter(
          (button) =>
            [
              'Primary action',
              'Open dialog',
              'Open drawer',
              'Explore the system',
            ].includes(button.text ?? '') &&
            (button.width < 44 || button.height < 44),
        ),
    );
  check(`${name}: primary targets at least 44px`, smallTargets.length === 0, {
    small: smallTargets,
  });

  const focusSamples = [];
  for (let index = 0; index < 16; index += 1) {
    await page.keyboard.press('Tab');
    focusSamples.push(
      await page.evaluate(() => {
        const element = document.activeElement;
        const style = element ? getComputedStyle(element) : null;
        return {
          tag: element?.tagName,
          label:
            element?.getAttribute('aria-label') ??
            element?.textContent?.trim().slice(0, 24),
          outline: style?.outlineStyle,
          width: style?.outlineWidth,
        };
      }),
    );
  }
  check(
    `${name}: keyboard focus visible`,
    focusSamples.some(
      (sample) => sample.outline !== 'none' && sample.width !== '0px',
    ),
    { focus: focusSamples },
  );

  await page.getByRole('button', { name: 'Open dialog' }).click();
  check(
    `${name}: dialog opens`,
    await page
      .getByRole('dialog')
      .filter({ hasText: 'Leave this checkpoint?' })
      .isVisible(),
  );
  check(
    `${name}: dialog receives focus`,
    await page.evaluate(() =>
      Boolean(document.activeElement?.closest('[role=dialog]')),
    ),
  );
  await page.keyboard.press('Tab');
  check(
    `${name}: dialog traps focus`,
    await page.evaluate(() =>
      Boolean(document.activeElement?.closest('[role=dialog]')),
    ),
  );
  await page.keyboard.press('Escape');
  check(
    `${name}: dialog closes`,
    (await page.locator('[role=dialog]').count()) === 0,
  );

  await page.getByRole('button', { name: 'Open drawer' }).click();
  check(
    `${name}: drawer opens`,
    await page.getByRole('dialog', { name: 'Quest menu' }).isVisible(),
  );
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Quest difficulty' }).focus();
  await page.keyboard.press('ArrowDown');
  check(
    `${name}: dropdown keyboard opens`,
    await page.getByRole('menu', { name: 'Quest difficulty' }).isVisible(),
  );
  await page.keyboard.press('Escape');

  await page.screenshot({
    path: path.join(scriptDirectory, `${name}.png`),
    fullPage: true,
  });
  await context.close();
}

await auditViewport({ width: 1440, height: 1000 }, 'desktop-1440x1000');
await auditViewport({ width: 390, height: 844 }, 'mobile-390x844');

const reducedContext = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  reducedMotion: 'reduce',
});
const reducedPage = await reducedContext.newPage();
await openShowcase(reducedPage);
await reducedPage.getByRole('button', { name: 'Preview reward' }).click();
const reducedMotion = await reducedPage
  .getByRole('alertdialog')
  .evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      transitionDuration: style.transitionDuration,
      animationDuration: style.animationDuration,
    };
  });
check(
  'reduced motion: reward is effectively instant',
  Number.parseFloat(reducedMotion.transitionDuration) <= 0.00001 &&
    Number.parseFloat(reducedMotion.animationDuration) <= 0.00001,
  reducedMotion,
);
await reducedContext.close();

check('runtime: no console errors', result.consoleErrors.length === 0, {
  errors: result.consoleErrors,
});
check('runtime: no page errors', result.pageErrors.length === 0, {
  errors: result.pageErrors,
});
check('runtime: no failed requests', result.requestFailures.length === 0, {
  failures: result.requestFailures,
});
check('runtime: no error responses', result.badResponses.length === 0, {
  responses: result.badResponses,
});

writeFileSync(
  path.join(scriptDirectory, 'browser-review.json'),
  JSON.stringify(result, null, 2),
);
console.log(
  JSON.stringify(
    {
      summary: result.checks.reduce((summary, item) => {
        summary[item.result] = (summary[item.result] ?? 0) + 1;
        return summary;
      }, {}),
      browser: result.version,
    },
    null,
    2,
  ),
);
await browser.close();
