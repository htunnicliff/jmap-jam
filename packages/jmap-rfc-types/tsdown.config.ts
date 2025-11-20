import { execSync } from "node:child_process";
import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  target: ["esnext", "node18"],
  platform: "neutral",
  attw: {
    profile: "esmOnly"
  },
  dts: true,
  minify: {
    codegen: {
      removeWhitespace: false
    }
  },
  unbundle: true,
  onSuccess: () => {
    execSync("pnpm check:types", { stdio: "inherit" });
  }
});
