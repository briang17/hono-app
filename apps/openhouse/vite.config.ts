import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@packages/*": path.resolve(__dirname, "../../packages/*"),
      "@features/*": path.resolve(__dirname, "./src/features/*"),
    },
  },
  server: {
    host: true,
    port: 3000,
    allowedHosts: true
  },
});
