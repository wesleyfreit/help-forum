import { resolve } from 'node:path';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    tsConfigPaths(),
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
  test: {
    pool: 'threads',
    workspace: [
      {
        extends: true,
        test: {
          globals: true,
          name: 'e2e',
          include: ['**/*.e2e-spec.ts'],
          setupFiles: ['./test/setup-e2e.ts'],
          root: './',
        },
      },
      {
        extends: true,
        test: {
          globals: true,
          name: 'unit',
          include: ['**/*.spec.ts'],
          root: './',
        },
      },
    ],
  },
});

// export default defineConfig({
//   test: {
//     alias: {
//       '@': resolve(__dirname, './src'),
//     },
//     globals: true,
//     name: 'e2e',
//     include: ['**/*.e2e-spec.ts'],
//     setupFiles: ['./test/setup-e2e.ts'],
//     root: './',
//   },
//   plugins: [
//     // This is required to build the test files with SWC
//     swc.vite({
//       // Explicitly set the module type to avoid inheriting this value from a `.swcrc` config file
//       module: { type: 'es6' },
//     }),
//   ],
// });
