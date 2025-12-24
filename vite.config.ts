import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Use root path for dev, GitHub Pages path for production build
  base: command === 'serve' ? '/' : '/Pandactory/',
  server: {
    host: true, // lyssna på LAN/WAN (0.0.0.0)
    port: 3000,
    // allowedHosts: ['mindomän.tf'],
  },
}))