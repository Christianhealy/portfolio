// Standalone Vitest config: the Lovable Vite wrapper (vite.config.ts) adds SSR/nitro plugins
// that aren't needed — or safe — for unit and component tests.
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { imagetools } from "vite-imagetools";
import { fileURLToPath } from "node:url";
import { contentPlugin, IMAGE_FILTER } from "./src/lib/content/vite-plugin";

export default defineConfig({
  // Tests always read src/content/__fixtures__/valid, never real content.
  plugins: [
    contentPlugin({
      root: fileURLToPath(new URL("./src/content/__fixtures__/valid", import.meta.url)),
      fixtures: true,
    }),
    imagetools({ include: IMAGE_FILTER }),
    react(),
  ],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: false,
  },
});
