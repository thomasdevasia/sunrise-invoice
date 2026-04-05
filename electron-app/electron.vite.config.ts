import { defineConfig, externalizeDepsPlugin } from "electron-vite"
import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      lib: {
        entry: resolve(__dirname, "electron/main.ts"),
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      lib: {
        entry: resolve(__dirname, "electron/preload.ts"),
        formats: ["cjs"],
      },
      rollupOptions: {
        output: {
          entryFileNames: "preload.cjs",
        },
      },
    },
  },
  renderer: {
    root: __dirname,
    resolve: {
      alias: {
        "~": resolve(__dirname, "app"),
        "@": resolve(__dirname, "app"),
      },
    },
    plugins: [react(), tailwindcss()],
    build: {
      rollupOptions: {
        input: resolve(__dirname, "index.html"),
      },
    },
  },
})
