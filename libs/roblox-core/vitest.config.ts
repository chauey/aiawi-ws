import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['libs/roblox-core/src/**/*.spec.ts'],
    exclude: ['**/node_modules/**'],
    fileParallelism: false, // Avoid shared state conflicts
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['libs/roblox-core/src/**/*.ts'],
      exclude: ['**/*.spec.ts', '**/index.ts'],
    },
  },
});
