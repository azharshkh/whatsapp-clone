import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/REPO-NAME/", // change this to your GitHub repo name
  plugins: [react()],
});
