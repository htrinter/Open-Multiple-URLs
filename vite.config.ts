import { fileURLToPath, URL } from "node:url"

import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import {viteStaticCopy} from "vite-plugin-static-copy";
import * as path from 'path';
import * as fs from 'fs';
import {version} from './package.json'

const copyManifestWithVersion = () => {
  return {
    name: 'copy-manifest-with-version',
    generateBundle() {
      const target = process.env.TARGET
      if (["firefox", "chrome"].indexOf(target ?? "") === -1) {
        throw new Error("Please specify process.env.TARGET 'firefox' or 'chrome'.")
      }

      const manifestSourcePath = path.resolve(__dirname, `./src/manifest/${target}/manifest.json`)
      const manifestContent = fs.readFileSync(manifestSourcePath, 'utf-8').replace('__VERSION__', String(version))

      const manifestTargetDir =  path.resolve(__dirname, `./dist-${target}/`)
      if (!fs.existsSync(manifestTargetDir)){
        fs.mkdirSync(manifestTargetDir);
      }

      const manifestTargetPath = path.resolve(manifestTargetDir, "manifest.json")
      fs.writeFileSync(manifestTargetPath, manifestContent, 'utf-8');
    }
  }
};

export default defineConfig({
  plugins: [
    vue(),
    viteStaticCopy({
      targets: [
        {
          src: "src/icons/*.png",
          dest: ""
        }
      ]
    }),
      copyManifestWithVersion()
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
      },
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor";
          }
        }
      }
    }
  }
})
