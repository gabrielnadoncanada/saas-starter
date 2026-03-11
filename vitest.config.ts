import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import path from "path";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "."),
    },
  },
});
