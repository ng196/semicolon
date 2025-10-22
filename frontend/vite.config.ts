import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0", // Allow external connections
    port: 8080,
    allowedHosts: [
      "localhost",
      ".ngrok.io",
      ".ngrok-free.app",
      ".ngrok.app",
      "4a4d6b5803f2.ngrok-free.app", // Your specific ngrok URL
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
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
