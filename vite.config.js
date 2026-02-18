import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { compression } from 'vite-plugin-compression2'

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          '@vscode-elements': [
            '@vscode-elements/react-elements',
            '@vscode-elements/webview-playground'
          ],
          jotai: ['jotai', 'jotai-immer'],
          react: ['react', 'react-dom']
        }
      }
    }
  },
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']]
      }
    }),
    compression()
  ]
})
