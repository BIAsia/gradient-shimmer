import path from "node:path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// The site dogfoods the package straight from its source, so edits to the
// component show up here instantly.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "gradient-shimmer": path.resolve(__dirname, "../src/index.ts"),
    },
  },
  server: {
    port: 3020,
    fs: { allow: [path.resolve(__dirname, "..")] },
  },
})
