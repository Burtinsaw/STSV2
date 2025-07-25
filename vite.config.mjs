import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import jsconfigPaths from 'vite-jsconfig-paths';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const API_URL = `${env.VITE_APP_BASE_NAME}`;
  // this sets a default port to 3000
  const PORT = `${'3000'}`;

  return {
    server: {
      // this ensures that the browser opens upon server start
      open: true,
      port: PORT,
      // API PROXY AYARI - Backend'e yönlendirme
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api')
        }
      }
    },
    define: {
      global: 'window'
    },
    resolve: {
      //     alias: [
      //       {
      //         find: /^~(.+)/,
      //         replacement: path.join(process.cwd(), 'node_modules/$1')
      //       },
      //       {
      //         find: /^src(.+)/,
      //         replacement: path.join(process.cwd(), 'src/$1')
      //       }
      //     ]
    },
    preview: {
      // this ensures that the browser opens upon preview start
      open: true,
      port: PORT,
      // Preview modunda da proxy ayarı
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api')
        }
      }
    },
    base: API_URL,
    plugins: [react(), jsconfigPaths()]
  };
});

