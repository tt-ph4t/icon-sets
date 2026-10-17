import {useScrollLock} from '@reactuses/core'
import '@vscode-elements/webview-playground'
import codiconUrl from '@vscode/codicons/dist/codicon.css?url'
import React from 'react'
import {preconnect} from 'react-dom'
import {createRoot} from 'react-dom/client'

import {Boundary} from './components/boundary'
import {Devtools} from './components/devtools'
import {ProgressRing} from './components/progress-ring'
import {component} from './hocs'
import {DATABASE_URL} from './misc/constants'
import './styles.css'

const Page = React.lazy(() => import('./page'))

const ScrollLock = component(() => {
  useScrollLock(document.body, true)
})

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
      <Boundary fallback={<ProgressRing>Loading</ProgressRing>}>
        <Page />
      </Boundary>
    </div>
    <link
      href={codiconUrl}

      // https://vscode-elements.github.io/components/icon
      id='vscode-codicon-stylesheet'

      rel='stylesheet'
    />
    <ScrollLock />
    <Devtools />
  </>
)
