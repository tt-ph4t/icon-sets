import {TanStackDevtools} from '@tanstack/react-devtools'
import {hotkeysDevtoolsPlugin} from '@tanstack/react-hotkeys-devtools'
import {pacerDevtoolsPlugin} from '@tanstack/react-pacer-devtools'
import {ReactQueryDevtoolsPanel} from '@tanstack/react-query-devtools/build/modern/production.js'

import {component} from '../hocs'
import {useSettings} from '../hooks/use-settings'
import {QUERY_CLIENT, THEME} from '../misc/constants'
import {Slot} from './slot'
import {VscodeDevToolbar} from './theme'
import {ToolbarButton} from './toolbar-button'

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

export const Devtools = Object.assign(
  component(() => {
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
  }),
  {
    Toggle: component(props => {
      const settings = useSettings()
      const {isDev} = settings.useSelectValue('isDev')

      return (
        <Slot
          onClick={() => {
            settings.toggle('isDev')
          }}>
          <ToolbarButton checked={isDev} controlled icon='code' {...props} />
        </Slot>
      )
    })
  }
)
