import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const target = (process.env.VITE_BACKEND_URL || "").trim();

if (!target) {
  throw new Error("[env] Missing VITE_BACKEND_URL for dev proxy.");
}

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
