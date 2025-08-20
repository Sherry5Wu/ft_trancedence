import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr';
import autoprefixer from 'autoprefixer';


export default defineConfig({
  plugins: [react(), tailwindcss(), svgr()],
  server: {
    host: true,
    port: 9000,
    // Make HMR connect back through the HTTPS reverse proxy
    hmr: {
      protocol: 'wss',
      host: 'localhost',
      clientPort: 8443,
    },
    origin: 'https://localhost:8443',
  },
  optimizeDeps: {
    force: true,
  },
})