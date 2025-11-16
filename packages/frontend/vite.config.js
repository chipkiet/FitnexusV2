import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  let target = (env.VITE_BACKEND_URL || process.env.VITE_BACKEND_URL || "").trim();
  if (!target) {
    target = "http://localhost:3001";
    console.warn("[env] VITE_BACKEND_URL missing. Falling back to http://localhost:3001 for dev proxy.");
  }

  return {
    plugins: [react()],
    server: {
      host: "0.0.0.0",
      proxy: {
        "/api": {
          target,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
