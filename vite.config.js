// https://performance.dev/how-is-linear-so-fast-a-technical-breakdown

import {devtools} from '@tanstack/devtools-vite'
import react from '@vitejs/plugin-react'
import {minimatch} from 'minimatch'
import {defineConfig, transformWithEsbuild} from 'vite'
import {compression} from 'vite-plugin-compression2'
import preload from 'vite-plugin-preload'

export default defineConfig({
  build: {
    modulePreload: {
      polyfill: false
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            const [, pkg] = id.match(/node_modules\/([^/]+)/)

            if (pkg) return `vendor-${pkg}`
          }
        }
      }
    },
    target: 'esnext'
  },
  plugins: [
    devtools({
      removeDevtoolsOnBuild: false
    }),
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
    preload(),
    compression()
  ]
})
