import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintPluginUnusedImports from 'eslint-plugin-unused-imports';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const baseConfig = {
  extends: [eslint.configs.recommended, eslintPluginPrettierRecommended],
  plugins: {
    'unused-imports': eslintPluginUnusedImports,
  },
  rules: {
    '@typescript-eslint/no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
  },
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
    'frontend/',
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
