import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  target: ["esnext", "node18"],
  platform: "neutral",
  attw: {
    profile: "esmOnly"
  },
  minify: true
});
