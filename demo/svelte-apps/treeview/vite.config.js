import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

export default defineConfig({
  plugins: [svelte()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'TreeviewApp',
      fileName: () => 'treeview-app.js',
      formats: ['iife']
    },
    rollupOptions: {
      output: {
        assetFileNames: 'treeview-app.[ext]'
      }
    }
  }
});
