import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { serwist } from '@serwist/vite';

export default defineConfig({
  plugins: [react(), serwist({ swSrc: 'src/sw.ts', swDest: 'sw.js', globDirectory: 'dist', injectionPoint: 'self.__SW_MANIFEST', rollupFormat: 'iife', globPatterns: ['**/*.{js,css,html,json,svg}'] })],
  build: { manifest: true },
  test: { include: ['src/**/*.test.ts'] },
});
