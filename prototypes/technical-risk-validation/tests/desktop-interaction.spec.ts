import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('save-state')).toHaveText('Saved on this device');
});

test('E01/E06 keyboard editing, selection, undo redo, focus escape and distinct feedback', async ({ page, browser }, info) => {
  const editor = page.getByRole('textbox', { name: 'JavaScript source' });
  await editor.focus();
  await editor.press('Control+a');
  await page.keyboard.type('console.log("Ready for CodeQuest");');
  await editor.press('Control+End');
  await editor.press('Enter');
  await page.keyboard.type('// selected line');
  await editor.press('Home');
  await editor.press('Shift+End');
  await page.keyboard.type('// replaced line');
  await expect(editor).toHaveText('console.log("Ready for CodeQuest");// replaced line', { useInnerText: false });
  await editor.press('Control+z');
  await expect(editor).toContainText('selected line');
  await editor.press('Control+y');
  await expect(editor).toContainText('replaced line');
  const source = await page.evaluate(() => window.__risk.source());
  expect(source).toContain('\n// replaced line');
  await editor.press('Escape');
  await expect(page.getByRole('button', { name: 'Run', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('feedback')).toHaveText('success');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Check', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('feedback')).toContainText('Local check passed');
  const focusRows = [];
  for (let step = 0; step < 24; step++) {
    await page.keyboard.press('Tab');
    focusRows.push(await page.evaluate(() => {
      const active = document.activeElement;
      if (!(active instanceof HTMLElement)) throw new Error('No active HTML element');
      const style = getComputedStyle(active);
      return { tag: active.tagName, text: active.textContent?.slice(0, 120), label: active.getAttribute('aria-label'), outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth, className: active.className };
    }));
  }
  for (const name of ['Stop', 'Reset source', 'Copy source', 'Save pending snapshot', 'Replay pending snapshot', 'Explicitly import guest snapshot', 'Open bounded preview']) {
    expect(focusRows.some(row => row.tag === 'BUTTON' && row.text === name), name).toBe(true);
  }
  await page.evaluate(() => {
    window.__desktopKeys = [];
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      const target = event.target instanceof HTMLElement ? event.target.outerHTML.slice(0, 500) : '';
      setTimeout(() => window.__desktopKeys.push({ target, prevented: event.defaultPrevented, active: document.activeElement instanceof HTMLElement ? document.activeElement.outerHTML.slice(0, 500) : '' }), 0);
    }, { capture: true });
  });
  for (const [input, feedback] of [['const = ;', 'syntax-error'], ['throw Error("synthetic error")', 'runtime-error'], ['console.log("wrong")', 'Check failed']] as const) {
    await editor.fill(input);
    await editor.focus();
    await editor.press('Escape');
    try { await expect(page.getByRole('button', { name: 'Run', exact: true })).toBeFocused(); }
    catch (error) {
      await info.attach('escape-diagnostic', { body: JSON.stringify(await page.evaluate(() => ({ keys: window.__desktopKeys, source: window.__risk.source() }))), contentType: 'application/json' });
      throw error;
    }
    if (feedback === 'Check failed') await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('feedback')).toContainText(feedback);
    expect(await page.evaluate(() => window.__risk.source())).toBe(input);
  }
  await editor.fill(source);
  await expect(page.getByTestId('save-state')).toHaveText('Saved on this device');
  await page.reload();
  await expect(page.getByTestId('save-state')).toHaveText('Saved on this device');
  expect(await page.evaluate(() => window.__risk.source())).toBe(source);
  await info.attach('desktop-keyboard', { body: JSON.stringify({ browser: browser.version(), operator: 'Codex via Playwright keyboard events', sourcePreserved: true, focusRows, nvda: 'untested', voiceOver: 'untested', physicalTyping: false }), contentType: 'application/json' });
});

test('E01 zoom shortcuts and narrow reflow preserve essential actions and source', async ({ page, browser }, info) => {
  const editor = page.getByRole('textbox', { name: 'JavaScript source' });
  const source = 'console.log("Ready for CodeQuest");';
  await editor.fill(source);
  const baseline = await page.evaluate(() => ({ dpr: devicePixelRatio, width: innerWidth, visualScale: visualViewport?.scale }));
  const zoomRows = [];
  for (const [requested, steps] of [[200, 4], [400, 7]] as const) {
    await page.getByRole('heading', { name: 'CodeQuest validation workspace' }).click();
    await page.keyboard.press('Control+0');
    for (let step = 0; step < steps; step++) await page.keyboard.press('Control+Equal');
    const observed = await page.evaluate(() => ({ dpr: devicePixelRatio, width: innerWidth, visualScale: visualViewport?.scale }));
    zoomRows.push({ requestedPercent: requested, observed, actualBrowserZoomObserved: Math.abs(observed.dpr / baseline.dpr - requested / 100) < 0.05 });
  }
  await page.keyboard.press('Control+0');
  await info.attach('browser-zoom-attempt', { body: JSON.stringify({ browser: browser.version(), baseline, zoomRows, note: 'Actual zoom must be confirmed by geometry; shortcuts alone do not pass zoom' }), contentType: 'application/json' });
  await page.setViewportSize({ width: 320, height: 800 });
  await expect(page.getByRole('heading', { name: 'CodeQuest validation workspace' })).toBeVisible();
  const overflow = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
  expect(overflow.document).toBeLessThanOrEqual(322);
  for (const name of ['Run', 'Check', 'Stop', 'Reset source', 'Copy source', 'Open bounded preview']) {
    const action = page.getByRole('button', { name, exact: true });
    await action.scrollIntoViewIfNeeded();
    await expect(action).toBeVisible();
    const box = await action.boundingBox();
    if (!box) throw new Error('Missing action geometry');
    expect(box.x, name).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width, name).toBeLessThanOrEqual(322);
  }
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  await expect(page.getByTestId('feedback')).toContainText('Local check passed');
  expect(await page.evaluate(() => window.__risk.source())).toBe(source);
  await info.attach('desktop-zoom-reflow', { body: JSON.stringify({ browser: browser.version(), baseline, zoomRows, overflow, narrowViewportIsMobileEvidence: false, note: 'Unobserved browser zoom is untested, never replaced by CSS zoom; 320px is desktop reflow only' }), contentType: 'application/json' });
});

test('E01 reduced-motion preference and accessibility tree expose essential text', async ({ page, context, browserName }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const motion = await page.evaluate(() => ({ preference: matchMedia('(prefers-reduced-motion: reduce)').matches, activeAnimations: document.getAnimations().filter(animation => animation.playState === 'running').length, scrollBehavior: getComputedStyle(document.body).scrollBehavior }));
  expect(motion.preference).toBe(true);
  expect(motion.activeAnimations).toBe(0);
  await page.getByRole('button', { name: 'Show hint' }).click();
  await expect(page.getByText('Change the text between the quotes')).toBeVisible();
  await page.getByLabel('Task').selectOption('RECORDS');
  await page.getByRole('button', { name: 'Open bounded preview' }).click();
  await expect(page.getByText('Text equivalent: 5', { exact: true })).toBeVisible();
  let tree: unknown = 'CDP unavailable for non-Chromium; role assertions performed';
  if (browserName === 'chromium') {
    const session = await context.newCDPSession(page);
    try {
      const result = await session.send('Accessibility.getFullAXTree');
      tree = result.nodes.filter(node => !node.ignored && ['button', 'textbox', 'heading', 'status', 'StaticText'].includes(String(node.role?.value))).map(node => ({ role: node.role?.value, name: node.name?.value }));
    } finally { await session.detach(); }
  }
  await info.attach('desktop-motion-ax', { body: JSON.stringify({ motion, tree, preferenceMethod: 'browser media emulation; global Windows preference unchanged', screenReaderComprehension: 'untested; accessibility tree does not establish NVDA or VoiceOver speech' }), contentType: 'application/json' });
});

test('E01 instrumented input-to-next-rendered-frame latency records ten warmup and hundred samples', async ({ page, browser }, info) => {
  const editor = page.getByRole('textbox', { name: 'JavaScript source' });
  await editor.fill('// latency ');
  await editor.press('Control+End');
  await page.evaluate(() => {
    window.__desktopLatency = [];
    document.querySelector('.cm-content')?.addEventListener('beforeinput', event => {
      if (!(event instanceof InputEvent) || event.inputType !== 'insertText') return;
      const started = performance.now();
      const expected = window.__risk.source() + (event.data ?? '');
      requestAnimationFrame(() => {
        const retained = window.__risk.source() === expected;
        window.__desktopLatency.push({ elapsed: performance.now() - started, expectedSourceRetained: retained });
      });
    }, { capture: true });
  });
  for (let edit = 0; edit < 110; edit++) {
    await page.keyboard.type('x');
    await page.waitForFunction(count => window.__desktopLatency.length === count, edit + 1);
  }
  const samples = await page.evaluate(() => window.__desktopLatency);
  expect(samples).toHaveLength(110);
  expect(samples.every(sample => sample.expectedSourceRetained)).toBe(true);
  const measured = samples.slice(10).map(sample => sample.elapsed).sort((a, b) => a - b);
  const p95 = measured[94];
  await info.attach('desktop-input-latency', { body: JSON.stringify({ browser: browser.version(), samples, warmup: 10, measured: 100, p95, diagnosticThresholdMs: 100, diagnosticWithinThreshold: p95 !== undefined && p95 <= 100, boundary: 'beforeinput receipt to next animation-frame callback with exact current source; frame proxy, not actual pixel presentation or physical input', physicalTyping: false, lowerPoweredDeviceDeclared: false, b01PhysicalVerdict: 'untested; scope adjustment required to use this automated diagnostic as progression evidence' }), contentType: 'application/json' });
});

declare global {
  interface Window {
    __desktopLatency: { elapsed: number; expectedSourceRetained: boolean }[];
    __desktopKeys: { target: string; prevented: boolean; active: string }[];
  }
}
