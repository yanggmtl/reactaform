import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(process.cwd(), "src/index.ts"),
      name: "ReactaForm",
      // produce ES and CommonJS bundles
      formats: ["es", "cjs"],
      fileName: (format) => `reactaform.${format}.js`
    },
    outDir: "dist",
    rollupOptions: {
      // Exclude peer dependencies from bundle
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "react-window",
      ],
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
          // CommonJS
          format: 'cjs',
          entryFileNames: 'reactaform.cjs.js',
          exports: 'named'
        }
      ]
    }
  }
});
