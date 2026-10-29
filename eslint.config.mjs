import path from 'node:path'
import { fileURLToPath } from 'node:url'

import js from '@eslint/js'
import nextPlugin from '@next/eslint-plugin-next'
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const nextRecommendedRules = nextPlugin.configs.recommended.rules
const nextCoreWebVitalsRules = nextPlugin.configs['core-web-vitals'].rules
const reactRecommendedRules = reactPlugin.configs.flat.recommended.rules
const reactJsxRuntimeRules = reactPlugin.configs.flat['jsx-runtime'].rules
const jsxA11yRecommendedRules = jsxA11yPlugin.flatConfigs.recommended.rules
const tsRecommendedRules = Object.assign(
  {},
  ...tseslint.configs.recommended.map((config) => config.rules ?? {})
)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const mirrorMediaNextRoot = path.join(__dirname, 'packages/mirror-media-next')

export default [
  {
    ignores: [
      '.git/**',
      '**/node_modules/**',
      '**/.yalc/**',
      '**/.next/**',
      '**/.next-dev/**',
      '**/.next-analyze/**',
      '**/dist/**',
      '**/__generated__/**',
      '**/next-env.d.ts',
      '**/public/sw.js',
      '**/public/_storybook/**',
      '**/public/storybook/**',
      '**/public/workbox-*.js',
      '**/public/worker-*.js',
    ],
  },
  {
    files: ['**/*.{js,jsx,mjs}'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      '@next/next': nextPlugin,
      'jsx-a11y': jsxA11yPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'simple-import-sort': simpleImportSortPlugin,
    },
    settings: {
      next: {
        rootDir: [mirrorMediaNextRoot],
      },
      react: {
        version: '19.2.7',
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...nextRecommendedRules,
      ...nextCoreWebVitalsRules,
      ...reactRecommendedRules,
      ...reactJsxRuntimeRules,
      ...jsxA11yRecommendedRules,
      'react/prop-types': 'off',
      'react/display-name': 'off',
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react/no-unknown-property': 'error',
      'react/jsx-no-target-blank': ['error', { allowReferrer: true }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'simple-import-sort/imports': [
        'warn',
        {
          groups: [
            ['^\\u0000'],
            ['^node:'],
            ['^react', '^next', '^@?\\w'],
            ['^'],
            ['^\\.\\.'],
            ['^\\.'],
          ],
        },
      ],
      'simple-import-sort/exports': 'warn',
      'no-unused-vars': ['error', { caughtErrors: 'none' }],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      '@next/next': nextPlugin,
      '@typescript-eslint': tseslint.plugin,
      'jsx-a11y': jsxA11yPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'simple-import-sort': simpleImportSortPlugin,
    },
    settings: {
      next: {
        rootDir: [mirrorMediaNextRoot],
      },
      react: {
        version: '19.2.7',
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tsRecommendedRules,
      ...nextRecommendedRules,
      ...nextCoreWebVitalsRules,
      ...reactRecommendedRules,
      ...reactJsxRuntimeRules,
      ...jsxA11yRecommendedRules,
      'react/prop-types': 'off',
      'react/display-name': 'off',
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react/no-unknown-property': 'error',
      'react/jsx-no-target-blank': ['error', { allowReferrer: true }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'simple-import-sort/imports': [
        'warn',
        {
          groups: [
            ['^\\u0000'],
            ['^node:'],
            ['^react', '^next', '^@?\\w'],
            ['^'],
            ['^\\.\\.'],
            ['^\\.'],
          ],
        },
      ],
      'simple-import-sort/exports': 'warn',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { caughtErrors: 'none' }],
    },
  },
  {
    files: ['packages/mirror-media-next/next.config.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
    },
  },
  {
    files: ['packages/mirror-media-next/service-worker/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.serviceworker,
        firebase: 'readonly',
      },
    },
  },
  {
    files: [
      'packages/mirror-media-next/modules/{account,authentication,commerce,magazine,membership,paper-magazine,subscription}/**/*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/pages/**', '../../pages/**', '../../../pages/**'],
              message:
                'Capability modules must not import route-owned policy from pages/.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['packages/mirror-media-next/modules/membership/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/pages/**', '../../pages/**', '../../../pages/**'],
              message:
                'Capability modules must not import route-owned policy from pages/.',
            },
            {
              group: [
                '@/modules/account/**',
                '@/modules/authentication/**',
                '../account/**',
                '../authentication/**',
              ],
              message:
                'The shared membership capability must not depend on account or authentication flows.',
            },
          ],
        },
      ],
    },
  },
  eslintPluginPrettierRecommended,
]
