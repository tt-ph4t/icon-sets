import '@vscode-elements/webview-playground'
import codiconUrl from '@vscode/codicons/dist/codicon.css?url'
import React from 'react'
import { createRoot } from 'react-dom/client'
import root from 'react-shadow'

import { lazy } from './app/shared/hocs'
import './globals.css'

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
        bottom: 'calc(var(--spacing) * 3)',
        left: 'calc(var(--spacing) * 3)',
        position: 'absolute',
        right: 'unset'
      }}
    />
  </>
)
