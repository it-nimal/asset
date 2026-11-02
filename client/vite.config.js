import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    // Updated dev server port to avoid conflict with backend
    port: 5002,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
        xfwd: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            let clientIp = req.socket?.remoteAddress || req.connection?.remoteAddress;
            if (clientIp) {
              if (clientIp.startsWith('::ffff:')) clientIp = clientIp.substring(7);
              if (clientIp === '::1') clientIp = '127.0.0.1';
              const existing = req.headers['x-forwarded-for'];
              proxyReq.setHeader('x-forwarded-for', existing ? `${existing}, ${clientIp}` : clientIp);
            }
          });
        },
      },
    },
  },
});
