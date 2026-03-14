import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  build: { outDir: "dist-portal", rollupOptions: { input: "portal.html" } },
  server: { proxy: { "/api": "http://localhost:3001", "/portal": "http://localhost:3001" } },
  define: { __API_BASE__: JSON.stringify("https://api.biscuitbar.cafe") }
});
