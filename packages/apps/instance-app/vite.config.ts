import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      // During development point the package name to the workspace source so
      // both runtime code and TypeScript types stay in sync without rebuilding.
      'reactaform': path.resolve(__dirname, '../../reactaform/src/package')
    }
  }
});
