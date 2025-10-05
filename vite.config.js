import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  css: {
    lightningcss: false, // 🚫 disable lightningcss — fixes Vercel build
  },
});
