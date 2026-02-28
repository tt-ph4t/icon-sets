import '@vscode-elements/webview-playground'
import codiconUrl from '@vscode/codicons/dist/codicon.css?url'
import React from 'react'
import { createRoot } from 'react-dom/client'
import root from 'react-shadow'

import { GITHUB_REPO } from './app/shared/constants'
import { lazy } from './app/shared/hocs'
import './index.css'

const App = lazy(() => import('./app'))
const QueryClientProvider = lazy(() => import('./query-client-provider'))

{
  let error = new Error(`https://github.com/${GITHUB_REPO}`)

  for (let index = 1; index < 1e3; index++)
    error = new Error(error.message, { cause: error })

  console.error(new Error('GitHub', { cause: error }))
}

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
