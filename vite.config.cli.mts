import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/cli/index.ts'),
      formats: ['cjs'],
      fileName: () => 'cli.js',
    },
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      external: [
        // Externalize Node builtins only — bundle everything else
        /^node:/,
        'fs',
        'path',
        'os',
        'child_process',
        'url',
        'buffer',
        'crypto',
        'stream',
        'events',
        'util',
        'http',
        'https',
        'net',
        'tls',
        'zlib',
      ],
      output: {
        banner: '#!/usr/bin/env node',
      },
    },
    target: 'node18',
    minify: false,
  },
  resolve: { alias: { src: resolve('src/') } },
});
