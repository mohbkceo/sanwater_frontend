import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // JSX component references are not marked as reads without the full
      // eslint-plugin-react package. Keep the existing uppercase convention,
      // include the project's Framer Motion namespace, and cover component
      // aliases destructured from props.
      'no-unused-vars': ['error', {
        varsIgnorePattern: '^(?:[A-Z_]|motion$)',
        argsIgnorePattern: '^[A-Z_]',
      }],
    },
  },
])
