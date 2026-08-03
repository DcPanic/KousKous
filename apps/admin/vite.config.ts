import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const workspaceRoot = path.resolve(__dirname, '../..');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    fs: {
      // @kouskous/shared is consumed as TypeScript source from the
      // workspace root, which sits outside this app's directory.
      allow: [workspaceRoot],
    },
  },
});
