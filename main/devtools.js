import {ReactQueryDevtools} from '@tanstack/react-query-devtools/build/modern/production.js'
import '@vscode-elements/webview-playground'
import React from 'react'

import {QUERY_CLIENT} from './app/constants'
import {component} from './app/hocs'
import {useSettings} from './app/hooks/use-settings'

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
      <ReactQueryDevtools client={QUERY_CLIENT} />
    </React.Activity>
  )
})
