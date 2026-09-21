import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const frontendRoot = process.cwd();
const assetRoot = resolve(frontendRoot, 'public/assets/design-system');
const globals = readFileSync(
  resolve(frontendRoot, 'src/styles/globals.css'),
  'utf8',
);

function channel(value: number): number {
  const normalized = value / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const value = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((offset) =>
    channel(Number.parseInt(value.slice(offset, offset + 2), 16)),
  );
  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
}

function contrast(foreground: string, background: string): number {
  const light = Math.max(luminance(foreground), luminance(background));
  const dark = Math.min(luminance(foreground), luminance(background));
  return (light + 0.05) / (dark + 0.05);
}

describe('CodeQuest identity contract', () => {
  it.each([
    ['ink on canvas', '#f3f4ef', '#070a12', 4.5],
    ['muted on surface', '#aebbd0', '#0b1020', 4.5],
    ['mint on canvas', '#53f6a6', '#070a12', 3],
    ['amber on canvas', '#ffcb5c', '#070a12', 3],
    ['sky on canvas', '#69b7ff', '#070a12', 3],
    ['danger on canvas', '#ff7777', '#070a12', 3],
    ['dark ink on mint', '#06130d', '#53f6a6', 4.5],
    ['dark ink on amber', '#161006', '#ffcb5c', 4.5],
  ])(
    '%s meets its contrast target',
    (_name, foreground, background, target) => {
      expect(contrast(foreground, background)).toBeGreaterThanOrEqual(target);
    },
  );

  it('defines the semantic palette, local display font, and reduced-motion override', () => {
    for (const token of [
      '--color-canvas',
      '--color-ascent',
      '--color-reward',
      '--color-discovery',
      '--color-danger',
      '--font-display',
    ]) {
      expect(globals).toContain(token);
    }
    expect(globals).toContain('/assets/design-system/fonts/pixelify-sans.ttf');
    expect(globals).toContain('@media (prefers-reduced-motion: reduce)');
  });

  it('keeps every purposeful visual asset documented and individually bounded', () => {
    const manifest = readFileSync(resolve(assetRoot, 'ASSETS.md'), 'utf8');
    const visualAssets = [
      'brand/codequest-mark.svg',
      'emblems/debugger-beetle.svg',
      'emblems/builder-cube.svg',
      'emblems/pathfinder-flag.svg',
      'frames/avatar-circuit.svg',
      'worlds/foundations-valley.webp',
    ];
    for (const asset of visualAssets) {
      expect(statSync(resolve(assetRoot, asset)).size).toBeLessThan(250_000);
      expect(manifest).toContain(`\`${asset}\``);
    }
    expect(manifest).toContain('fonts/pixelify-sans.ttf');
    expect(manifest).toContain('SIL Open Font License 1.1');
  });

  it('keeps the showcase development-only and covers the required visual surfaces', () => {
    const route = readFileSync(
      resolve(frontendRoot, 'src/app/design-system/page.tsx'),
      'utf8',
    );
    const showcase = readFileSync(
      resolve(frontendRoot, 'src/app/design-system/showcase-client.tsx'),
      'utf8',
    );
    expect(route).toContain("process.env.NODE_ENV === 'production'");
    expect(route).toContain('notFound()');
    for (const surface of [
      'CodeQuestLogo',
      'QuestPath',
      'ChapterCard',
      'AchievementCard',
      'AvatarSpecimen',
      'XPBar',
      'LevelBadge',
      'RewardPopup',
      'Dialog',
      'Drawer',
      'Dropdown',
    ]) {
      expect(showcase).toContain(surface);
    }
  });
});
