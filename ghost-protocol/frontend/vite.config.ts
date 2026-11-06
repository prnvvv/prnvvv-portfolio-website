import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// Allows the browser to call the chatbot backend: adds its origin to the CSP `connect-src` in index.html.
// Dev defaults to the local backend; production uses VITE_CHATBOT_API_URL (no origin added when unset).
function chatbotCsp(mode: string): Plugin {
  return {
    name: 'chatbot-csp',
    transformIndexHtml(html) {
      const env = loadEnv(mode, process.cwd(), 'VITE_')
      const configured = env.VITE_CHATBOT_API_URL?.trim()
      let origins: string[] = []
      try {
        if (configured) origins = [new URL(configured).origin]
        else if (mode === 'development') origins = ['http://127.0.0.1:8000', 'http://localhost:8000']
      } catch {
        origins = []
      }
      return html.replace("connect-src 'self'", `connect-src 'self'${origins.map((o) => ' ' + o).join('')}`)
    },
  }
}

export default defineConfig(({ mode }) => ({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [react(), tailwindcss(), chatbotCsp(mode)],
  server: {
    port: 3000,
  },
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : undefined,
  },
  build: {
    sourcemap: false,
  },
}))
