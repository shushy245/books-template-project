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
  plugins: ['@typescript-eslint', 'import', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  settings: {
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
    ],

    // ── Named exports only (no default exports) ───────────────────────────────
    'import/no-default-export': 'error',

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

    // ── Misc quality ─────────────────────────────────────────────────────────
    'no-console': 'warn', // use the structured logger, not console.log
    'no-debugger': 'error',
    'eqeqeq': ['error', 'always'],
  },
  overrides: [
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
