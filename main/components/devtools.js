import {TanStackDevtools} from '@tanstack/react-devtools'
import {hotkeysDevtoolsPlugin} from '@tanstack/react-hotkeys-devtools'
import {pacerDevtoolsPlugin} from '@tanstack/react-pacer-devtools'
import {ReactQueryDevtoolsPanel} from '@tanstack/react-query-devtools/build/modern/production.js'
import {omit} from 'es-toolkit'
import React from 'react'

import {component} from '../hocs'
import {useSettings} from '../hooks/use-settings'
import {QUERY_CLIENT, THEME} from '../misc/constants'
import {VscodeDevToolbar} from './theme'

const TanStackDevtoolsProps = {
  plugins: [
    ...Object.entries(omit(QUERY_CLIENT, ['METHODS'])).map(
      ([name, client]) => ({
        name: `TanStack Query (${name})`,
        render: <ReactQueryDevtoolsPanel client={client} />
      })
    ),
    pacerDevtoolsPlugin(),
    hotkeysDevtoolsPlugin()
  ]
}

export default component(() => {
  const isDev = useSettings().useSelectValue(({draft}) => draft.isDev)

  return (
    <>
      <VscodeDevToolbar
        style={{
          bottom: 'calc(var(--SPACING) * 18)',
          display: isDev ? 'block' : 'none', // ?
          right: 'calc(var(--SPACING) * 4)'
        }}
      />
      <React.Activity mode={isDev ? 'visible' : 'hidden'}>
        <TanStackDevtools
          config={{
            theme: THEME.DEFAULT_COLOR_SCHEME
          }}
          {...TanStackDevtoolsProps}
        />
      </React.Activity>
    </>
  )
})
