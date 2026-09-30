import { expect, test } from '@playwright/test';

const journey = {
  id: 'JAVASCRIPT-FOUNDATIONS',
  slug: 'javascript-foundations',
  title: 'JavaScript Foundations',
  position: 1,
  chapterCount: 1,
  questCount: 1,
};
const chapter = {
  id: 'CH01',
  slug: 'values-and-state',
  title: 'Values and state',
  position: 1,
  objectiveSummary: 'Choose a value.',
  questCount: 1,
};
const quest = {
  id: 'Q01',
  slug: 'first-value',
  title: 'First value',
  position: 1,
  kind: 'instructional',
  guestEligible: true,
  contentVersion: '1.0.0',
  assessmentVersion: '1.0.0',
  difficulty: 'introductory',
  xpAward: 10,
  hierarchy: { journey, chapter },
  objective: 'Print one value.',
  outcomeId: 'O1',
  concepts: [{ id: 'js-values', title: 'JavaScript values' }],
  prerequisites: [],
  hints: {
    question: 'What should print?',
    concept: 'A value is data.',
    nextStep: 'Try one change.',
  },
  lesson: '# Mission briefing\n\nRead the value, then run the code.',
  starterCode: "console.log('old');",
  cases: [
    {
      id: 'q01-normal',
      category: 'normal',
      kind: 'console',
      feedback: 'Match the output.',
      expectedOutput: 'new',
    },
  ],
};

test('production offline library opens without editor tooling', async ({
  page,
}) => {
  await page.goto('/offline-learning');
  await expect(
    page.getByRole('heading', { name: 'Downloaded lessons', level: 1 }),
  ).toBeVisible();
  await expect(page.getByRole('textbox', { name: /code editor/ })).toHaveCount(
    0,
  );
  await expect(
    page.getByRole('button', { name: 'Load code editor' }),
  ).toHaveCount(0);
});

test('production Quest defers editor and measures isolated cold/subsequent Run and Check', async ({
  page,
}, testInfo) => {
  await page.route('http://127.0.0.1:3001/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    await route.fulfill({
      status: path === '/api/v1/quests/first-value' ? 200 : 404,
      contentType: 'application/json',
      json:
        path === '/api/v1/quests/first-value'
          ? quest
          : { error: { code: 'NOT_FOUND', message: 'Not found' } },
    });
  });

  await page.goto('/quests/first-value');
  await expect(
    page.getByRole('heading', { name: 'First value', level: 1 }),
  ).toBeVisible();
  const loadEditor = page.getByRole('button', { name: 'Load code editor' });
  await expect(loadEditor).toBeVisible();
  await loadEditor.click();
  const editor = page.getByRole('textbox', {
    name: 'main.js code editor (javascript)',
  });
  await expect(editor).toBeVisible();
  const edit = async (source: string) => {
    await editor.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.insertText(source);
  };
  const run = async (source: string, output: string) => {
    await edit(source);
    const start = performance.now();
    await page.getByRole('button', { name: 'Run', exact: true }).click();
    await expect(page.getByText(output, { exact: true }).first()).toBeVisible();
    return Math.round(performance.now() - start);
  };
  const coldRunMs = await run(
    "globalThis.phase36Marker = 42; console.log('first run');",
    'first run',
  );
  const subsequentRunMs = await run(
    'console.log(typeof globalThis.phase36Marker);',
    'undefined',
  );
  await edit("console.log('new');");
  const checkStart = performance.now();
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  await expect(page.getByText(/Local check passed — unverified/)).toBeVisible();
  const localCheckMs = Math.round(performance.now() - checkStart);
  console.log(
    JSON.stringify({
      engine: testInfo.project.name,
      coldRunMs,
      subsequentRunMs,
      localCheckMs,
      workerIsolation: 'marker absent on second run',
    }),
  );
});
