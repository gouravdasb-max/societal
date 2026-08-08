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
        id: '/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: '/screenshot-desktop.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Societal Desktop Dashboard'
          },
          {
            src: '/screenshot-mobile.png',
            sizes: '720x1280',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Societal Mobile Interface'
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
