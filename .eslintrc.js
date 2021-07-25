module.exports = {
  'env': {
    'browser': true,
    'es2021': true,
  },
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'ecmaVersion': 12,
    'sourceType': 'module',
  },
  'plugins': [
    '@typescript-eslint',
  ],
  'rules': {
    'indent': ['error', 2, { SwitchCase: 1 }],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'always-multiline'],
    'no-undef': ['error'],
    'space-infix-ops': ['error'],
    '@typescript-eslint/no-unused-vars': ['error'],
  },
};
