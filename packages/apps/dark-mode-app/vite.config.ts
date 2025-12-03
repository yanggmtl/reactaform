import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  // Use the repo root `public/` during dev so root-level static assets
  // (e.g. `public/locales/...`) are served at `/locales/...`.
  // This lets the library code fetch `/locales/...` from the example dev server
  // without duplicating files into the example package.
  // Serve this app's local `public/` folder during dev so app-specific
  // static assets are resolved locally (avoids relying on the repo root).
  publicDir: path.resolve(__dirname, 'public'),
  resolve: {
    alias: {
      // During development, import reactaform directly from source so
      // edits (console.log, etc.) show up without rebuilding the package.
      'reactaform': path.resolve(__dirname, '../../reactaform/src/package')
    }
  }
})
