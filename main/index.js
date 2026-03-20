import {QueryClientProvider} from '@tanstack/react-query'
import codiconUrl from '@vscode/codicons/dist/codicon.css?url'
import {noop} from 'es-toolkit'
import React from 'react'
import {createRoot} from 'react-dom/client'
import root from 'react-shadow'

import {Layout} from './app/components/layout'
import {QUERY_CLIENT} from './app/constants'
import {lazy} from './app/hocs/lazy'
import './styles/index.css'

const App = lazy(() => import('./app/(page)'))
const Devtools = lazy(() => import('./devtools'))

createRoot(document.querySelector('#root')).render(
  <>
    <div
      style={{
        alignContent: 'center',
        alignSelf: 'center',
        flexGrow: 1
      }}>
      <Layout>
        <root.div
          style={{
            height: 'inherit',
            width: 'inherit'
          }}>
          <QueryClientProvider client={QUERY_CLIENT}>
            <React.Activity>
              <App />
            </React.Activity>
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
