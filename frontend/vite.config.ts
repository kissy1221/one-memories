import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";

// vitest の設定は vite の UserConfig に含まれないため、test を拡張して受け付ける。
const config: UserConfig & { test?: Record<string, unknown> } = {
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
  },
};

export default defineConfig(config);
