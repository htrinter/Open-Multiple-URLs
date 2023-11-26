import { fileURLToPath, URL } from "node:url"

import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import {viteStaticCopy} from "vite-plugin-static-copy";
import { version } from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    viteStaticCopy({
      targets: [
        {
          src: "src/icons/*.png",
          dest: ""
        },
        {
          src: ["firefox", "chrome"]
              .filter(browser => {
                if (!process.env.TARGET || ["firefox", "chrome"].indexOf(process.env.TARGET) === -1) {
                  throw new Error("Please specify process.env.TARGET 'firefox' or 'chrome'.")
                }
                return process.env.TARGET == browser
              })
              .map(browser => `src/manifest/${browser}/manifest.json`)[0],
          dest: ""
        }
      ]
    })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  build: {
    outDir: `dist-${process.env.TARGET?.toLowerCase()}`,
    minify: false,
    cssMinify: false,
    rollupOptions: {
      input: {
        BrowserAction: "./browseraction.html",
        LazyLoading: "./lazyloading.html",
        ClipperContentScript: "./src/clipper/content-script.ts"
      },
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
        entryFileNames() {
          return `assets/[name]-${version}.js`;
        }
      },
    }
  }
})
