import path from "path"
import tailwindcss from "@tailwindcss/vite"
import type { UserConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vite.dev/config/
export default {
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: '/Inventory-management/',
} satisfies UserConfig