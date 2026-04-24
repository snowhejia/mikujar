import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiPort = env.VITE_DEV_API_PORT || "3002";
  const target = `http://127.0.0.1:${apiPort}`;

  return {
    base: "./",
    clearScreen: false,
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return;
            if (id.includes("@tiptap") || id.includes("prosemirror")) {
              return "tiptap";
            }
            if (id.includes("@vercel/analytics") || id.includes("@vercel/speed-insights")) {
              return "vercel-insights";
            }
            return undefined;
          },
        },
      },
    },
    envPrefix: ["VITE_"],
    server: {
      host: true,
      port: 5173,
      strictPort: true,
      proxy: {
        "/api": {
          target,
          changeOrigin: true,
          bypass(req) {
            // 前端源码目录 frontend/api/*.ts 被 Vite 以 /api/xxx.ts 提供，
            // 这里放行源码/样式/map 请求，只把真正的接口调用转给后端
            if (/\.(ts|tsx|js|jsx|css|map)(\?|$)/.test(req.url || "")) {
              return req.url;
            }
          },
        },
        "/uploads": {
          target,
          changeOrigin: true,
        },
      },
    },
  };
});
