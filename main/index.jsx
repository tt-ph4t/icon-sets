import '@vscode-elements/webview-playground'
import codiconUrl from '@vscode/codicons/dist/codicon.css?url'
import devtoolsDetector from 'devtools-detector'
import React from 'react'
import { createRoot } from 'react-dom/client'
import root from 'react-shadow'

import { GITHUB_REPO } from './app/shared/constants'
import { lazy } from './app/shared/hocs'
import './index.css'

const App = lazy(() => import('./app'))
const QueryClientProvider = lazy(() => import('./query-client-provider'))

createRoot(document.querySelector('#root')).render(
  <>
    <QueryClientProvider>
      <root.div>
        <React.Activity>
          <App />
        </React.Activity>
      </root.div>
    </QueryClientProvider>
    <link
      href={codiconUrl}
      id='vscode-codicon-stylesheet' // https://vscode-elements.github.io/components/icon/
      rel='stylesheet'
    />
    <vscode-dev-toolbar
      style={{
        bottom: 'calc(var(--spacing) * 2)',
        get left() {
          return this.bottom
        },
        position: 'absolute',
        right: 'unset'
      }}
    />
  </>
)

if (import.meta.env.PROD) {
  let idleId

  const max = 1e6

  devtoolsDetector.addListener(isOpen => {
    if (isOpen) {
      let index = 1
      let error = new Error(index)

      const callback =
        // https://viblo.asia/p/event-loop-trong-javascript-microtask-macrotask-promise-va-cac-cau-hoi-phong-van-pho-bien-GyZJZjrbJjm
        () => {
          if (isOpen) {
            do {
              index++
              error = new Error(index, { cause: error })
            } while (index % (max * 0.01))

            if (index === max) {
              devtoolsDetector.stop()

              console.error(
                new Error(`https://github.com/${GITHUB_REPO}`, { cause: error })
              )
            } else idleId = requestIdleCallback(callback)
          }
        }

      idleId = requestIdleCallback(callback)
    } else {
      cancelIdleCallback(idleId)
      devtoolsDetector.launch()

      idleId = undefined
    }
  })

  devtoolsDetector.launch()
}
