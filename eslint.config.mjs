import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const baseConfig = {
  extends: [eslint.configs.recommended, eslintPluginPrettierRecommended],
};

const baseBackendConfig = {
  files: ['backend/*/{src,apps,test,libs}/**/*.ts'],
  extends: [...tseslint.configs.recommendedTypeChecked],
  languageOptions: {
    globals: {
      ...globals.node,
    },
    sourceType: 'commonjs',
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-floating-promises': 'warn',
    '@typescript-eslint/no-unsafe-argument': 'warn',
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
  },
};

export default defineConfig(
  globalIgnores([
    'eslint.config.mjs',
    'backend/**/dist/**',
    'backend/**/node_modules/**',
  ]),
  baseConfig,
  baseBackendConfig,
  {
    files: [
      'backend/*/{src,test}/**/*.spec.ts',
      'backend/*/{src,test}/**/*.test.ts',
    ],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
);
