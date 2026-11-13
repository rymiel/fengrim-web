import { readFileSync } from "node:fs";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const pkg = JSON.parse(readFileSync("./package.json", "utf8"));
const lock = JSON.parse(readFileSync("./package-lock.json", "utf8"));

export default defineConfig({
  root: "src",
  publicDir: "../static",
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  define: {
    WEB_VERSION: JSON.stringify(pkg.version),
    CWC_VERSION: JSON.stringify(lock.packages["node_modules/conlang-web-components"].version),
  },
  server: { port: 3002, strictPort: true, host: true },
  build: { outDir: "../build", emptyOutDir: true, assetsDir: "static" },
});
