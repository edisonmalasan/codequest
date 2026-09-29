import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import manifest from '@/app/manifest';

describe('PWA installation assets', () => {
  it('uses standalone public metadata with declared PNG dimensions', () => {
    const value = manifest();
    expect(value).toMatchObject({
      id: '/',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      name: 'CodeQuest',
    });
    for (const icon of value.icons ?? []) {
      const file = readFileSync('public' + icon.src);
      expect(file.subarray(1, 4).toString()).toBe('PNG');
      expect(`${file.readUInt32BE(16)}x${file.readUInt32BE(20)}`).toBe(
        icon.sizes,
      );
    }
    expect(value.icons?.some((icon) => icon.purpose === 'maskable')).toBe(true);
    const apple = readFileSync('public/icons/apple-touch-icon.png');
    expect(apple.readUInt32BE(16)).toBe(180);
  });
  it('provides a script-free public fallback with local assets and truthful guidance', () => {
    const html = readFileSync('public/offline.html', 'utf8');
    expect(html).toContain('lang="en"');
    expect(html).toContain('<h1>');
    expect(html).toContain('href="/"');
    expect(html.replace(/\s+/g, ' ')).toContain(
      'Account progress needs a connection',
    );
    expect(html).not.toMatch(/<script|https?:\/\//);
  });
});
