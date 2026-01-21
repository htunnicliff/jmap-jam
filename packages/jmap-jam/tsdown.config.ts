import { execSync } from "node:child_process";
import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  target: ["esnext", "node18"],
  platform: "neutral",
  attw: {
    profile: "esm-only"
  },
  dts: true,
  minify: true,
  onSuccess: () => {
    execSync("pnpm check:types", { stdio: "inherit" });
  }
});
