import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  format: "esm",
  clean: true,
  minifyWhitespace: true,
  minifySyntax: true,
  target: ["es2018"],
  sourcemap: true,
  dts: true
});
