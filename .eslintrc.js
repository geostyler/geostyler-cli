module.exports = {
  env: {
    browser: true,
    es2020: true
  },
  extends: [
    'airbnb-base'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    'no-console': 'off',
    'no-unused-vars': 'off',
    'comma-dangle': ['warn', 'never'],
    '@typescript-eslint/no-unused-vars': 'error'
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts']
    },
    'import/extensions': {
      ts: 'never'
    }
  }
};
