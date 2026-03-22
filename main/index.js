import {QueryClientProvider} from '@tanstack/react-query'
import {VscodeProgressRing} from '@vscode-elements/react-elements'
import codiconUrl from '@vscode/codicons/dist/codicon.css?url'
import {noop} from 'es-toolkit'
import React from 'react'
import {createRoot} from 'react-dom/client'
import {ErrorBoundary} from 'react-error-boundary'
import root from 'react-shadow'

import {Fallback} from './app/components/fallback'
import {Layout} from './app/components/layout'
import {QUERY_CLIENT} from './app/constants'
import './styles/index.css'

const App = React.lazy(() => import('./app/(page)'))
const Devtools = React.lazy(() => import('./devtools'))

createRoot(document.querySelector('#root')).render(
  <>
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        height: 'var(--height)',
        justifyContent: 'center',
        width: 'var(--width)'
      }}>
      <Layout>
        <root.div
          style={{
            display: 'flex',
            height: 'inherit',
            width: 'inherit'
          }}>
          <QueryClientProvider client={QUERY_CLIENT}>
            <ErrorBoundary
              fallbackRender={({error, resetErrorBoundary}) => (
                <Fallback.Error progressBar={false}>
                  {error.message}
                  <Fallback.TryAgainButton onClick={resetErrorBoundary} />
                </Fallback.Error>
              )}>
              <React.Suspense
                fallback={<VscodeProgressRing style={{margin: 'auto'}} />}>
                <React.Activity>
                  <App />
                </React.Activity>
              </React.Suspense>
            </ErrorBoundary>
          </QueryClientProvider>
        </root.div>
      </Layout>
    </div>
    <link
      href={codiconUrl}
      id='vscode-codicon-stylesheet' // https://vscode-elements.github.io/components/icon/
      rel='stylesheet'
    />
    <Devtools />
  </>
)

if (import.meta.env[Symbol()]) {
  let idleId

  const max = 1e6

  {
    let index = 1

    const callback = () => {
      do index++
      while (index % (max * 0.01))

      if (index === max) {
        noop()
      } else idleId = requestIdleCallback(callback)
    }

    idleId =
      // https://viblo.asia/p/event-loop-trong-javascript-microtask-macrotask-promise-va-cac-cau-hoi-phong-van-pho-bien-GyZJZjrbJjm
      requestIdleCallback(callback)

    // cancelIdleCallback(idleId)
    // idleId = undefined
  }
}
