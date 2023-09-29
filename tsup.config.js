import { defineConfig } from "tsup";
import { execSync } from "child_process";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  format: ["cjs", "esm"],
  clean: true,
  target: ["es2022"],
  async onSuccess() {
    execSync("tsc");
  },
});
