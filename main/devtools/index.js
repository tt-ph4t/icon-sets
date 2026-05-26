import {TanStackDevtools} from '@tanstack/react-devtools'
import {pacerDevtoolsPlugin} from '@tanstack/react-pacer-devtools'
import {ReactQueryDevtoolsPanel} from '@tanstack/react-query-devtools/build/modern/production.js'
import '@vscode-elements/webview-playground'
import {omit} from 'es-toolkit'
import React from 'react'

import {component} from '../app/hocs'
import {useSettings} from '../app/hooks/use-settings'
import {QUERY_CLIENT, THEME} from '../app/misc/constants'
import githubDevtoolsPlugin from './github-devtools-plugin'

const TanStackDevtoolsProps = {
  plugins: [
    ...Object.entries(omit(QUERY_CLIENT, ['ACTIONS'])).map(
      ([name, client]) => ({
        name: `TanStack Query (${name})`,
        render: <ReactQueryDevtoolsPanel client={client} />
      })
    ),
    pacerDevtoolsPlugin(),
    githubDevtoolsPlugin({
      defaultOpen: true
    })
  ]
}

export default component(() => {
  const isDev = useSettings().useSelectValue(({draft}) => draft.isDev)

  return (
    <React.Activity mode={isDev ? 'visible' : 'hidden'}>
      <vscode-dev-toolbar
        style={{
          bottom: 'calc(var(--spacing) * 18)',
          right: 'calc(var(--spacing) * 4)'
        }}
      />
      <TanStackDevtools
        config={{
          theme: THEME.DEFAULT_COLOR_SCHEME
        }}
        {...TanStackDevtoolsProps}
      />
    </React.Activity>
  )
})
