import {TanStackDevtools} from '@tanstack/react-devtools'
import {pacerDevtoolsPlugin} from '@tanstack/react-pacer-devtools'
import {ReactQueryDevtoolsPanel} from '@tanstack/react-query-devtools/build/modern/production.js'
import '@vscode-elements/webview-playground'
import React from 'react'

import {component} from '../app/hocs'
import {useSettings} from '../app/hooks/use-settings'
import {QUERY_CLIENT} from '../app/misc/constants'

const TanStackDevtoolsProps = {
  plugins: [
    {
      defaultOpen: true,
      name: 'TanStack Query',
      render: <ReactQueryDevtoolsPanel client={QUERY_CLIENT} />
    },
    pacerDevtoolsPlugin()
  ]
}

export default component(() => {
  const showDevtools = useSettings().useSelectValue(
    ({draft}) => draft.showDevtools
  )

  return (
    <React.Activity mode={showDevtools ? 'visible' : 'hidden'}>
      <vscode-dev-toolbar
        style={{
          bottom: 'calc(var(--spacing) * 18)',
          right: 'calc(var(--spacing) * 4)'
        }}
      />
      <TanStackDevtools {...TanStackDevtoolsProps} />
    </React.Activity>
  )
})
