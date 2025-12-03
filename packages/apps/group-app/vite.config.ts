import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  // Serve the app's local `public` folder so app-specific static assets
  // (like `reactaform.svg`) are available and avoid /favicon.ico 404 warnings.
  publicDir: path.resolve(__dirname, 'public'),
  resolve: {
    alias: {
      // During development, import reactaform directly from source so
      // edits (console.log, etc.) show up without rebuilding the package.
      'reactaform': path.resolve(__dirname, '../../reactaform/src/package')
    }
  }
})
