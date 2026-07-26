import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "lib/htyp.ts",
  platform: "browser",
  minify: true,
});
