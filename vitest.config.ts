import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['lib/**/*.test.ts', 'lib/**/*.test.tsx', 'components/**/*.test.ts', 'components/**/*.test.tsx'],
    exclude: ['node_modules', '.kilo', 'e2e'],
  },
});