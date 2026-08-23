import {TanStackDevtools} from '@tanstack/react-devtools'
import {hotkeysDevtoolsPlugin} from '@tanstack/react-hotkeys-devtools'
import {pacerDevtoolsPlugin} from '@tanstack/react-pacer-devtools'
import {ReactQueryDevtoolsPanel} from '@tanstack/react-query-devtools/build/modern/production.js'

import {component} from '../hocs'
import {useSettings} from '../hooks/use-settings'
import {QUERY_CLIENT, THEME} from '../misc/constants'
import {VscodeDevToolbar} from './theme'

const TanStackDevtoolsProps = {
  plugins: [
    ...Object.entries(QUERY_CLIENT).map(([a, b]) => ({
      name: `TanStack Query (${a})`,
      render: (
        <ReactQueryDevtoolsPanel
          client={b}
          theme={THEME.DEFAULT_COLOR_SCHEME}
        />
      )
    })),
    pacerDevtoolsPlugin(),
    hotkeysDevtoolsPlugin()
  ]
}

export default component(() => {
  const {isDev} = useSettings().useSelectValue('isDev')

  return (
    <>
      <VscodeDevToolbar
        style={{
          bottom: 'calc(var(--SPACING) * 18)',
          display: isDev ? 'block' : 'none',
          right: 'calc(var(--SPACING) * 4)'
        }}
      />
      {isDev && (
        <TanStackDevtools
          config={{
            theme: THEME.DEFAULT_COLOR_SCHEME,
            triggerMode: 'fixed'
          }}
          {...TanStackDevtoolsProps}
        />
      )}
    </>
  )
})
