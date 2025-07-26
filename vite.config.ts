import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          icons: ['lucide-react']
        }
      }
    }
  },

  // Development server
  server: {
    port: 5173,
    host: true,
    strictPort: true
  },

  // Preview server
  preview: {
    port: 4173,
    host: true,
    strictPort: true
  },

  // Environment variables
  define: {
    __APP_ENV__: JSON.stringify(process.env.NODE_ENV)
  },

  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});