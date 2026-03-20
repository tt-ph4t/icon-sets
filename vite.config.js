import react from '@vitejs/plugin-react'
import {minimatch} from 'minimatch'
import {defineConfig, transformWithEsbuild} from 'vite'
import {compression} from 'vite-plugin-compression2'

export default defineConfig({
  ebuild: {
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
    {
      enforce: 'pre',
      async transform(code, id) {
        if (minimatch(id, '**/*.+(js|jsx)'))
          return await transformWithEsbuild(code, id, {
            jsx: 'automatic',
            loader: 'jsx'
          })
      }
    },
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']]
      }
    }),
    compression()
  ]
})
