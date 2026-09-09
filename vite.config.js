import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { copyFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    vue(),
    {
      name: "copy-legal-notices",
      async closeBundle() {
        await Promise.all([
          copyFile(resolve(projectRoot, "LICENSE"), resolve(projectRoot, "dist/LICENSE")),
          copyFile(resolve(projectRoot, "NOTICE"), resolve(projectRoot, "dist/NOTICE")),
        ]);
      },
    },
  ],
  resolve: {
    // Preserve the existing extensionless Vue component imports during migration.
    extensions: [".mjs", ".js", ".mts", ".ts", ".jsx", ".tsx", ".json", ".vue"],
  },
  test: {
    include: ["tests/**/*.test.js"],
  },
});
