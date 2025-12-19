import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/barycentre/' : '/',
  publicDir: 'public',
  server: {
    port: 3000,
    open: true
  },
  assetsInclude: ['**/*.gz']
});
