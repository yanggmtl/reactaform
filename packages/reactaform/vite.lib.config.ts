import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/package/index.ts"),
      name: "ReactaForm",
      // produce ES, UMD and CommonJS bundles
      formats: ["es", "umd", "cjs"],
      fileName: (format) => `reactaform.${format}.js`
    },
    outDir: "dist",
    rollupOptions: {
      // Exclude peer dependencies from bundle
      external: ["react", "react-dom"],
      output: [
        {
          // ES module
          format: 'es',
          entryFileNames: 'reactaform.es.js',
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM'
          }
        },
        {
          // UMD
          format: 'umd',
          name: 'ReactaForm',
          entryFileNames: 'reactaform.umd.js',
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM'
          }
        },
        {
          // CommonJS
          format: 'cjs',
          entryFileNames: 'reactaform.cjs.js',
          exports: 'named'
        }
      ]
    }
  }
});
