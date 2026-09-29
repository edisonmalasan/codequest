import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '.next/**',
      '.next-preview/**',
      'node_modules/**',
      'next-env.d.ts',
      'public/sw.js',
      'public/sw.js.map',
      'public/swe-worker-*.js',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.strict,
);
