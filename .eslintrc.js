module.exports = {
  env: {
    es2020: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
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
    'no-console': 'off', // we should get rid off this exception
    'no-unused-vars': 'off',
    'comma-dangle': ['warn', 'never'],
    '@typescript-eslint/no-unused-vars': 'error'
  }
};
