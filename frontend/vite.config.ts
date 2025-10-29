import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0", // Allow external connections
    port: 8080,
    allowedHosts: [
      "localhost",
      ".onrender.com" // Allow all Render domains
    ],
    proxy: {
      // Proxy API requests to backend
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  preview: {
    host: "0.0.0.0", // Allow external connections in preview mode
    port: 3000,
    allowedHosts: [
      "localhost",
      ".ngrok.io",
      ".ngrok-free.app",
      ".ngrok.app",
      ".onrender.com" // Allow all Render domains
    ]
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}']
      },
      includeAssets: ['icon-192.svg', 'icon-512.svg', 'placeholder.svg'],
      manifest: {
        name: 'Saksham - Student Portal',
        short_name: 'Saksham',
        description: 'Connect with classmates, discover events, join clubs, and engage with your campus community',
        theme_color: '#6366f1',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any'
          }
        ],
        categories: ['education', 'social', 'productivity'],
        shortcuts: [
          {
            name: 'Dashboard',
            short_name: 'Home',
            description: 'Open Saksham Dashboard',
            url: '/dashboard'
          },
          {
            name: 'Events',
            short_name: 'Events',
            description: 'Browse campus events',
            url: '/events'
          },
          {
            name: 'Hubs',
            short_name: 'Hubs',
            description: 'Explore student hubs',
            url: '/hubs'
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
