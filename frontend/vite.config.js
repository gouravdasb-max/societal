import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Societal',
        short_name: 'Societal',
        description: 'Modern Residential Society Management',
        theme_color: '#07110b',
        background_color: '#07110b',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/2830/2830305.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'https://cdn-icons-png.flaticon.com/512/2830/2830305.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      injectRegister: 'auto',
      devOptions: {
        enabled: true
      }
    })
  ],
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/socket.io": {
        target: "http://localhost:8000",
        ws: true,
      }
    },
  },
});
