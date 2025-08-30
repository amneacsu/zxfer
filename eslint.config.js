import importPlugin from 'eslint-plugin-import';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import stylisticPlugin from '@stylistic/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: 'tsconfig.json',
      },
    },
    plugins: {
      import: importPlugin,
      'react-hooks': reactHooksPlugin,
      '@stylistic': stylisticPlugin,
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      'import/extensions': ['error', 'ignorePackages'],
      'import/no-unresolved': 'error',
      'no-shadow': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'react-hooks/rules-of-hooks': 'error',
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/indent': ['error', 2],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/semi': ['error', 'always'],
      '@typescript-eslint/no-unused-vars': ['error'],
      '@typescript-eslint/no-unnecessary-condition': ['error'],
    },
  },
];
