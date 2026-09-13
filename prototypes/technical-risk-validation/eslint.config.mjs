import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['node_modules/**', 'dist/**', 'test-results/**', 'playwright-report/**'] },
  ...tseslint.configs.recommended,
  { languageOptions: { globals: { ...globals.browser, ...globals.node, ...globals.worker } } },
);
