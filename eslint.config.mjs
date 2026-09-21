import eslint from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import playwright from 'eslint-plugin-playwright';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  globalIgnores([
    'node_modules/**',
    'test-results/**',
    'playwright-report/**',
    'blob-report/**',
    'playwright/.cache/**',
  ]),
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['tests/**/*.ts', 'pages/**/*.ts', 'fixtures/**/*.ts'],
    extends: [playwright.configs['flat/recommended']],
    rules: {
      'playwright/no-raw-locators': 'error',
      'playwright/prefer-native-locators': 'error',
      'playwright/no-wait-for-timeout': 'error',
    },
  },
  eslintConfigPrettier,
);
