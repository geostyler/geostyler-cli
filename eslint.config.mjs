import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const compat = new FlatCompat({
  baseDirectory: dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default [{
  ignores: ['eslint.config.mjs', 'dist', 'rollup.config.mjs', 'build', 'test.cjs', 'package-binaries.cjs', '.commitlintrc.cjs']
},
...compat.extends('@terrestris/eslint-config-typescript'), {
  files: ['**/*.ts', '**/*.tsx'],
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      project: ['./tsconfig.json'],
      tsconfigRootDir: dirname,
    }
  },
}, {
  rules: {
    'no-console': 'off',
  }
}];
