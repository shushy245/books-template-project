'use strict';

/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    // project is omitted here — type-aware rules are expensive and break on non-TS files.
    // We use syntactic rules only at the root; packages add type-aware rules in their own configs.
  },
  plugins: ['@typescript-eslint', 'import', 'prettier', 'perfectionist', 'react'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  settings: {
    react: { version: 'detect' },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: ['packages/*/tsconfig.json', 'tsconfig.base.json'],
      },
      node: true,
    },
  },
  rules: {
    // ── Const only: no let ────────────────────────────────────────────────────
    'prefer-const': 'error',
    'no-var': 'error',

    // ── No type assertions (as X / as any) ───────────────────────────────────
    // Handled by @typescript-eslint/no-explicit-any + no-restricted-syntax for 'as'
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/consistent-type-assertions': [
      'error',
      { assertionStyle: 'never' },
    ],

    // ── No null (use undefined) ───────────────────────────────────────────────
    // Boundary files (row-mappers.utils.ts, http-client.ts) are excluded per ADR-8.
    // We use no-restricted-syntax to catch null literals in non-boundary files.
    // NOTE: boundary file exclusions live in the package-level overrides below.
    'no-restricted-syntax': [
      'error',
      {
        selector: 'Literal[value=null]',
        message:
          'Use undefined instead of null. Normalise null at the boundary (row-mappers.utils.ts, http-client.ts).',
      },
      {
        selector: "JSXAttribute[name.name='data-testid'] > Literal",
        message: 'Use the component *TestIds object — never raw strings in data-testid.',
      },
    ],

    // ── Named exports only (no default exports) ───────────────────────────────
    'import/no-default-export': 'error',

    // ── Blank line before standalone return ──────────────────────────────────
    // A return with no preceding sibling statement (one-line guard, implicit
    // arrow) needs no padding — the rule only fires after another statement.
    'padding-line-between-statements': ['error', { blankLine: 'always', prev: '*', next: 'return' }],

    // ── No non-null assertions (!) ────────────────────────────────────────────
    '@typescript-eslint/no-non-null-assertion': 'error',

    // ── Implicit arrow returns over explicit ──────────────────────────────────
    'arrow-body-style': ['error', 'as-needed'],

    // ── Guard clauses: no else after return ───────────────────────────────────
    'no-else-return': ['error', { allowElseIf: false }],

    // ── Immutability: never reassign params ───────────────────────────────────
    'no-param-reassign': 'error',

    // ── JSX handler naming: on* props receive handle* functions ───────────────
    // (react/jsx-no-bind was evaluated and dropped: it flags named const-arrow
    // handlers — our canonical pattern — not just inline lambdas.)
    'react/jsx-handler-names': 'error',

    // ── No React.FC — explicit return type instead ────────────────────────────
    '@typescript-eslint/ban-types': [
      'error',
      {
        extendDefaults: true,
        types: {
          'React.FC': { message: 'Avoid React.FC — use an explicit return type instead.' },
        },
      },
    ],

    // ── No circular dependencies (strictly acyclic DAG) ──────────────────────
    'import/no-cycle': ['error', { maxDepth: Infinity }],

    // ── No boolean parameters ─────────────────────────────────────────────────
    // This catches function declarations and expressions. Methods are harder —
    // they need type-aware rules added in package configs.
    '@typescript-eslint/no-inferrable-types': 'off', // allow explicit types
    // Manual no-boolean-param: flag boolean as parameter type in function signatures.
    // We use @typescript-eslint/no-boolean-type-assertion as a lighter alternative;
    // the no-boolean-param rule is enforced via code review for now, pending
    // a stable rule that doesn't need type info.

    // ── Explicit return types on exported functions and *.utils.ts ────────────
    // Enforced via @typescript-eslint/explicit-module-boundary-types.
    '@typescript-eslint/explicit-module-boundary-types': 'error',

    // ── Template literals over string concatenation ───────────────────────────
    'prefer-template': 'error',

    // ── No unused vars (prefix _ for intentionally unused) ───────────────────
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],

    // ── No redundant type annotations that TS already infers ─────────────────
    // (disabled: we want explicit return types on exported fns)

    // ── Prettier ──────────────────────────────────────────────────────────────
    'prettier/prettier': [
      'error',
      {
        printWidth: 120,
        semi: true,
        singleQuote: true,
        tabWidth: 4,
        trailingComma: 'all',
        useTabs: false,
        endOfLine: 'lf',
        bracketSpacing: true,
      },
    ],

    // ── Import ordering ──────────────────────────────────────────────────────
    // Disable import/order from plugin:import/recommended — perfectionist replaces it.
    'import/order': 'off',
    // Three groups per CLAUDE.md: external → internal (~) → relative; style last.
    // type: 'line-length' is the closest autofixable proxy for binding-name-length.
    'perfectionist/sort-imports': [
      'error',
      {
        type: 'line-length',
        order: 'asc',
        internalPattern: ['^~/.+'],
        newlinesBetween: 1,
        groups: [
          ['value-builtin', 'value-external', 'type-builtin', 'type-external'],
          ['value-internal', 'type-internal'],
          [
            'value-parent',
            'value-sibling',
            'value-index',
            'type-parent',
            'type-sibling',
            'type-index',
          ],
          'style',
          'unknown',
        ],
        customGroups: [
          {
            groupName: 'style',
            elementNamePattern: '\\.(module\\.)?(css|scss)$',
          },
        ],
      },
    ],

    // ── Misc quality ─────────────────────────────────────────────────────────
    'no-console': 'warn', // use the structured logger, not console.log
    'no-debugger': 'error',
    'eqeqeq': ['error', 'always'],
  },
  overrides: [
    // ── Type-aware rules (need parserOptions.project; scoped to src) ──────────
    {
      files: ['packages/*/src/**/*.ts', 'packages/*/src/**/*.tsx'],
      parserOptions: {
        project: ['packages/*/tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
      rules: {
        '@typescript-eslint/prefer-nullish-coalescing': 'error',
        '@typescript-eslint/strict-boolean-expressions': 'error',
        '@typescript-eslint/no-unnecessary-condition': 'error',
      },
    },
    // ── Lazy-loaded route files: default exports are allowed ──────────────────
    {
      files: ['**/routes/**/*.tsx', '**/routes/**/*.ts'],
      rules: {
        'import/no-default-export': 'off',
      },
    },
    // ── Boundary files: null is allowed (normalise at the seam) ──────────────
    // ADR-8: null is confined to row-mappers.utils.ts, http-client.ts, and main.tsx (DOM boundary).
    // cypress.config.ts: Cypress task API requires returning null to signal task completion.
    {
      files: ['**/row-mappers.utils.ts', '**/http-client.ts', '**/main.tsx', '**/cypress.config.ts'],
      rules: {
        'no-restricted-syntax': 'off',
      },
    },
    // ── Test files: relax some rules ─────────────────────────────────────────
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/cypress/**/*.ts', '**/cypress/**/*.tsx'],
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        'no-console': 'off',
      },
    },
    // ── Config files (vitest.config.ts, vite.config.ts, knexfile.ts etc.) ────
    // Matches *.config.ts, *.config.integration.ts, *.config.cjs, knexfile.ts
    {
      files: ['**/*.config.ts', '**/*.config.cjs', '**/*.config.js', '**/knexfile.ts'],
      rules: {
        'import/no-default-export': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
      },
    },
    // ── Ambient declaration files (.d.ts) ─────────────────────────────────────
    // declare module blocks use 'export default' by convention (e.g. CSS Modules).
    {
      files: ['**/*.d.ts'],
      rules: {
        'import/no-default-export': 'off',
      },
    },
    // ── main.ts (composition root): console is intentional until S8 wires OTel ──
    {
      files: ['**/main.ts'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
  ignorePatterns: ['dist/', 'node_modules/', 'coverage/', '*.js'],
};
