import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: {
  '/api': {
    target: 'https://localhost:4200',
    secure: false,
  },
  '/session': {
    target: 'https://localhost:4200',
    secure: false,
  },
},
  },
});
