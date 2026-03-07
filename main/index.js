import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools/build/modern/production.js'
import '@vscode-elements/webview-playground'
import codiconUrl from '@vscode/codicons/dist/codicon.css?url'
import { noop } from 'es-toolkit'
import React from 'react'
import { createRoot } from 'react-dom/client'
import root from 'react-shadow'

import { QUERY_CLIENT } from './app/shared/constants'
import { component, lazy } from './app/shared/hocs'
import { useSettings } from './app/shared/hooks/use-settings'
import './index.css'

const App = lazy(() => import('./app'))

const Devtools = component(() => {
  const showDevtools = useSettings().useSelectValue(
    ({ draft }) => draft.current.showDevtools
  )

  return (
    <React.Activity mode={showDevtools ? 'visible' : 'hidden'}>
      <vscode-dev-toolbar
        style={{
          bottom: 'calc(var(--spacing) * 18)',
          right: 'calc(var(--spacing) * 4)'
        }}
      />
      <ReactQueryDevtools client={QUERY_CLIENT} />
    </React.Activity>
  )
})

createRoot(document.querySelector('#root')).render(
  <>
    <root.div
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
      <QueryClientProvider client={QUERY_CLIENT}>
        <React.Activity>
          <App />
        </React.Activity>
      </QueryClientProvider>
    </root.div>
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
