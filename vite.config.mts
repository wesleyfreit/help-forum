import swc from 'unplugin-swc';
import tsConfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

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
