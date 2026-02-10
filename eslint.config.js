import eslintReact from '@eslint-react/eslint-plugin'
import js from '@eslint/js'
import pluginQuery from '@tanstack/eslint-plugin-query'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import perfectionist from 'eslint-plugin-perfectionist'
import pluginPromise from 'eslint-plugin-promise'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactYouMightNotNeedAnEffect from 'eslint-plugin-react-you-might-not-need-an-effect'
import * as regexpPlugin from 'eslint-plugin-regexp'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'

const createRules = (type, ...rules) =>
  Object.fromEntries(rules.map(rule => [rule, type]))

export default defineConfig([
  globalIgnores(['dist']),
  {
    extends: [
      perfectionist.configs['recommended-natural'],

      js.configs.recommended,
      eslintPluginUnicorn.configs.recommended,
      pluginPromise.configs['flat/recommended'],
      regexpPlugin.configs['flat/recommended'],

      reactPlugin.configs.flat.recommended,
      reactPlugin.configs.flat['jsx-runtime'],

      reactHooks.configs.flat.recommended,

      eslintReact.configs.recommended,
      reactYouMightNotNeedAnEffect.configs.recommended,
      pluginQuery.configs['flat/recommended'],

      eslintConfigPrettier // ?
    ],
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ...reactPlugin.configs.flat.recommended.languageOptions,
      globals: globals.browser
    },
    rules: {
      ...createRules(
        // 9.39.2
        // https://eslint.org/docs/latest/rules

        // document.querySelectorAll('.rule').forEach(rule => {
        //   if (
        //     ![...rule.querySelectorAll('.rule__categories__type')].some(
        //       element =>
        //         !element.ariaHidden &&
        //         (element.textContent.includes('Fix') ||
        //           element.textContent.includes('Suggestions'))
        //     ) ||
        //     rule.classList.value !== 'rule  '
        //   )
        //     rule.style.display = 'none'
        // })
        'error',

        // Possible Problems
        'array-callback-return',
        'no-misleading-character-class',
        'no-promise-executor-return',
        'no-prototype-builtins',
        'no-unsafe-negation',
        'no-unused-vars',
        'use-isnan',
        'valid-typeof',

        // Suggestions
        // 'arrow-body-style',
        // 'capitalized-comments',
        // 'curly',
        'dot-notation',
        'eqeqeq',
        'logical-assignment-operators',
        'no-array-constructor',
        'no-case-declarations',
        'no-console',
        'no-div-regex',
        'no-else-return',
        'no-empty',
        'no-empty-function',
        'no-empty-static-block',
        'no-extra-bind',
        'no-extra-boolean-cast',
        'no-extra-label',
        'no-implicit-coercion',
        'no-lonely-if',
        'no-nonoctal-decimal-escape',
        'no-object-constructor',
        'no-regex-spaces',
        'no-undef-init',
        'no-unneeded-ternary',
        'no-unused-labels',
        'no-useless-computed-key',
        'no-useless-constructor',
        'no-useless-escape',
        'no-useless-rename',
        'no-useless-return',
        'no-var',
        'object-shorthand',
        // 'one-var',
        'operator-assignment',
        'prefer-arrow-callback',
        'prefer-const',
        'prefer-destructuring',
        'prefer-exponentiation-operator',
        'prefer-named-capture-group',
        'prefer-numeric-literals',
        'prefer-object-has-own',
        'prefer-object-spread',
        'prefer-regex-literals',
        'prefer-template',
        'preserve-caught-error',
        'radix',
        'require-await',
        'require-unicode-regexp',
        // 'sort-imports',
        'sort-vars',
        'strict',
        'yoda',

        // Layout & Formatting
        'unicode-bom'
      ),
      ...createRules(
        'error',

        '@eslint-react/jsx-shorthand-boolean',
        '@eslint-react/jsx-no-iife'
      ),
      ...createRules(
        'off',

        'unicorn/prevent-abbreviations',
        'unicorn/no-array-reduce',
        'unicorn/prefer-set-has',
        'unicorn/no-array-callback-reference',
        'unicorn/no-anonymous-default-export',
        'unicorn/no-await-expression-member',

        'react-hooks/exhaustive-deps',
        'react/display-name',

        '@eslint-react/no-children-map'
      )
    }
  }
])
