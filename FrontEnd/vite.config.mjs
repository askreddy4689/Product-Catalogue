import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The API server address in development (see Backend/.env, PORT)
const apiServer = 'http://localhost:4000';

/**
 * Vite runs the web app during development (npm run dev) and builds it for production.
 *
 * Requests to /api are forwarded to the API server, so the browser sees one address
 * for both and no cross-origin (CORS) set-up is needed. In production, the hosting
 * set-up should forward /api to the API in the same way.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': apiServer },
  },
  preview: {
    port: 4173,
    proxy: { '/api': apiServer },
  },
});
