import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/prochat': {
        target: 'https://teamchat.eks-saas.staging.houzz.net',
        changeOrigin: true,
        secure: false,
        ws: true,
      }
    }

  },
  preview: {
    proxy: {
      '/api/prochat': {
        target: 'https://teamchat.eks-saas.staging.houzz.net',
        changeOrigin: true,
        secure: false,
        ws: true,
      }
    }
  }
})
