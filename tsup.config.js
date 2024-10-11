import { execSync } from "node:child_process";
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  format: "esm",
  clean: true,
  minifyWhitespace: true,
  minifySyntax: true,
  target: ["es2018"],
  sourcemap: true,
  async onSuccess() {
    execSync("tsc");
  }
});
