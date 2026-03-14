import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  build: { outDir: "dist-kiosk", rollupOptions: { input: { main: "kiosk.html" } } },
  define: { __API_BASE__: JSON.stringify("https://api.biscuitbar.cafe") }
});
