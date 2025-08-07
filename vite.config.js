import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/whatsapp-clone/", // 👈 REQUIRED for GitHub Pages deployment
  plugins: [react()],
});
