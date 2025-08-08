import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // 警告が出る上限を1000KB（1MB）に設定
    chunkSizeWarningLimit: 2000,
  },
});
