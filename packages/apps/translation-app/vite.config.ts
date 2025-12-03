import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  publicDir: path.resolve(__dirname, '.', 'public'),
  resolve: {
    alias: {
      // During development, import reactaform directly from source so
      // edits (console.log, etc.) show up without rebuilding the package.
      'reactaform': path.resolve(__dirname, '../../reactaform/src/package')
    }
  }
})
