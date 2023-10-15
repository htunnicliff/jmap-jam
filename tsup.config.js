import { defineConfig } from "tsup";
import { execSync } from "child_process";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  format: "esm",
  clean: true,
  target: ["es2018"],
  sourcemap: true,
  async onSuccess() {
    execSync("tsc");
  },
});
