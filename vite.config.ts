import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// Project site on GitHub Pages: https://<user>.github.io/FitTracker/
const base = "/FitTracker/";

export default defineConfig({
  base,
  build: {
    chunkSizeWarningLimit: 800,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "pwa-192.png", "pwa-512.png"],
      manifest: {
        name: "FitTracker",
        short_name: "FitTracker",
        description: "Log the Bony to Beastly workout program, set by set.",
        theme_color: "#101410",
        background_color: "#101410",
        display: "standalone",
        orientation: "portrait",
        start_url: base,
        scope: base,
        lang: "en",
        icons: [
          {
            src: "pwa-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "pwa-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2,ico,webmanifest}"],
        navigateFallback: "index.html",
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
    }),
  ],
});
