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
    'no-console': 'off', // we should get rid of this exception
    'no-unused-vars': 'off', // because ts rule below takes care of this
    '@typescript-eslint/no-unused-vars': 'error',
    'comma-dangle': ['warn', 'never'],
    'import/no-unresolved': 'off', // tsc takes care of warning about this
    'import/extensions': 'off' // tsc does not want extensions and throws TS2691
  }
};
