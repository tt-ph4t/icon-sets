import '@vscode-elements/webview-playground'
import codiconUrl from '@vscode/codicons/dist/codicon.css?url'
import React from 'react'
import {preconnect} from 'react-dom'
import {createRoot} from 'react-dom/client'
import {ErrorBoundary} from 'react-error-boundary'
import root from 'react-shadow'

import {Fallback} from './components/fallback'
import {ProgressRing} from './components/progress-ring'
import {DATABASE_URL} from './misc/constants'
import Layout from './page/layout'
import './styles.css'

const Page = React.lazy(() => import('./page'))
const Devtools = React.lazy(() => import('./components/devtools'))

preconnect(new URL(DATABASE_URL).origin)

createRoot(document.querySelector('#root')).render(
  <>
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        height: 'var(--HEIGHT)',
        justifyContent: 'center',
        width: 'var(--WIDTH)'
      }}>
      <ErrorBoundary
        fallbackRender={({error, resetErrorBoundary}) => (
          <Fallback.Error
            message={error.message}
            progressBar={false}
            retryFn={resetErrorBoundary}
          />
        )}>
        <React.Suspense fallback={<ProgressRing>Loading</ProgressRing>}>
          <Layout.Resizable>
            <root.div
              style={{
                display: 'flex',
                height: 'inherit',
                width: 'inherit'
              }}>
              <Page />
            </root.div>
          </Layout.Resizable>
        </React.Suspense>
      </ErrorBoundary>
    </div>
    <React.Activity>
      <link
        href={codiconUrl}
        id='vscode-codicon-stylesheet' // https://vscode-elements.github.io/components/icon/
        rel='stylesheet'
      />
      <Devtools />
    </React.Activity>
  </>
)
