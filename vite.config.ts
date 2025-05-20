import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tsconfigPaths from 'vite-tsconfig-paths'; // ⬅️ Tambahan penting

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(), // ⬅️ Tambahkan ini biar semua alias di tsconfig.json dikenali
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'MeowIQ: Money Manager',
        short_name: 'MeowIQ',
        description: 'Kelola keuangan pribadi & dompet digital dengan gaya!',
        id: "/",
        start_url: "/",
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#4f46e5',
        orientation: 'portrait',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          }
        ],
        screenshots: [
          {
            src: "/screenshots/1.png",
            type: "image/png",
            sizes: "540x720",
            form_factor: "wide"
          },
          {
            src: "/screenshots/2.png",
            type: "image/png",
            sizes: "540x720",
            form_factor: "narrow"
          }
        ]
      }
    })
  ]
});