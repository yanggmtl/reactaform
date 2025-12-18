import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(process.cwd(), "src/index.ts"),
      name: "ReactaForm",
    },
    outDir: "dist",
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
      output: [
        {
          format: "es",
          entryFileNames: "reactaform.es.js",
        },
        {
          format: "cjs",
          entryFileNames: "reactaform.cjs.js",
          exports: "named",
        },
      ],
    },
  },
});
