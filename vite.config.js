// https://performance.dev/how-is-linear-so-fast-a-technical-breakdown

import {isString} from '@sindresorhus/is'
import {devtools} from '@tanstack/devtools-vite'
import react from '@vitejs/plugin-react'
import has from 'has-values'
import {minimatch} from 'minimatch'
import path from 'node:path'
import {defineConfig, transformWithEsbuild} from 'vite'
import {compression} from 'vite-plugin-compression2'
import preload from 'vite-plugin-preload'
import {VitePWA} from 'vite-plugin-pwa'

const nodeModulesPath = 'node_modules/'
const excludedPackages = ['@takumi-rs']

export default defineConfig({
  build: {
    modulePreload: {
      polyfill: false
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes(nodeModulesPath) &&
            excludedPackages.every(a => !id.includes(a))
          ) {
            const [, a] = id.split(nodeModulesPath)

            if (isString(a)) {
              const pathSegments = a.split('/')

              if (has(pathSegments))
                return `vendor-${
                  pathSegments[0].startsWith('@')
                    ? path.join(pathSegments[0], pathSegments[1])
                    : pathSegments[0]
                }`
            }
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
    compression(),
    VitePWA({
      injectRegister: 'script-defer',
      manifest: false,
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        maximumFileSizeToCacheInBytes: Number.MAX_SAFE_INTEGER,
        skipWaiting: true
      }
    })
  ]
})
