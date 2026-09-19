import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const stylesDir = join(dirname(fileURLToPath(import.meta.url)));
const globals = readFileSync(join(stylesDir, 'globals.css'), 'utf8');
const pixel = readFileSync(join(stylesDir, 'pixel.css'), 'utf8');

describe('design tokens', () => {
  it.each([
    '--color-surface',
    '--color-surface-raised',
    '--color-surface-sunken',
    '--color-line',
    '--color-ink',
    '--color-muted',
    '--color-ascent',
    '--color-ascent-ink',
    '--color-reward',
    '--color-reward-ink',
    '--color-success',
    '--color-danger',
    '--font-display',
    '--spacing',
    '--breakpoint-sm',
    '--breakpoint-md',
    '--breakpoint-lg',
    '--breakpoint-xl',
    '--breakpoint-2xl',
    '--radius-sm',
    '--radius-md',
    '--radius-lg',
    '--shadow-hard',
    '--shadow-soft',
    '--ease-ui',
    '--duration-quick',
    '--duration-base',
  ])('defines %s in the Tailwind theme', (token) => {
    expect(globals).toContain(token);
  });

  it('collapses motion under prefers-reduced-motion', () => {
    expect(globals).toContain('prefers-reduced-motion: reduce');
  });
});

describe('pixel styling language', () => {
  it.each([
    '.pixel-corners',
    '.pixel-corners-sm',
    '.pixel-frame',
    '.pixel-steps',
    ':focus-visible',
  ])('provides %s with a focus fallback', (selector) => {
    expect(pixel).toContain(selector);
  });
});
