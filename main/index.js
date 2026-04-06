import {VscodeProgressRing} from '@vscode-elements/react-elements'
import codiconUrl from '@vscode/codicons/dist/codicon.css?url'
import React from 'react'
import {preconnect} from 'react-dom'
import {createRoot} from 'react-dom/client'
import {ErrorBoundary} from 'react-error-boundary'
import root from 'react-shadow'

import Layout from './app/(page)/layout'
import {Fallback} from './app/components/fallback'
import {DATA_BASE_URL} from './app/misc/constants'
import './misc/styles/index.css'

const App = React.lazy(() => import('./app/(page)'))
const Devtools = React.lazy(() => import('./misc/devtools'))
const Providers = React.lazy(() => import('./misc/providers'))

preconnect(new URL(DATA_BASE_URL).origin)

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
      <Layout.Resizable>
        <root.div
          style={{
            display: 'flex',
            height: 'inherit',
            width: 'inherit'
          }}>
          <ErrorBoundary
            fallbackRender={({error, resetErrorBoundary}) => (
              <Fallback.Error
                message={error.message}
                progressBar={false}
                retryFn={resetErrorBoundary}
              />
            )}>
            <React.Suspense
              fallback={<VscodeProgressRing style={{margin: 'auto'}} />}>
              <Providers>
                <App />
              </Providers>
            </React.Suspense>
          </ErrorBoundary>
        </root.div>
      </Layout.Resizable>
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
