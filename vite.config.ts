import { defineConfig } from 'vitest/config';

// base './' permite publicar en cualquier subruta (GitHub Pages usa /nombre-del-repositorio/).
export default defineConfig({
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? 'dev'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1800, // Phaser pesa ~1,2 MB: es esperado
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
