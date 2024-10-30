import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...compat.extends(
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:vitest-globals/recommended',
  ),
  {
    ignores: ['**/*.config.*', '**/node_modules/', '**/build/', '**/coverage/'],
    languageOptions: {
      ecmaVersion: 'latest',
      parser: tsParser,
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'prettier/prettier': [
        'error',
        {
          configFile: '.prettierrc',
        },
      ],
    },
    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.d.ts'],
      },
    },
  },
];

// export default [
//   js.configs.recommended,
//   js.configs.recommended,
//   js.configs.all,
// {
//   extends: [
//     "eslint:recommended",
//     "plugin:@typescript-eslint/recommended",
//     "plugin:prettier/recommended",
//     "plugin:vitest-globals/recommended",
//   ],
//   ignores: ["**/*.config.*", "**/node_modules/", "**/build/", "**/coverage/"],
//   languageOptions: {
//     ecmaVersion: "latest",
//     parser: tsParser,
//     sourceType: "module",
//   },
//   plugins: {
//     "@typescript-eslint": typescriptEslint,
//   },
//   rules: {
//     "@typescript-eslint/no-unused-vars": "off",
//     "prettier/prettier": ["error", {
//       configFile: ".prettierrc.json",
//     }],
//   },
//   settings: {
//     "import/parsers": {
//       "@typescript-eslint/parser": [".ts", ".d.ts"],
//     },
//   },
// }];
