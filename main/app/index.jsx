import {
  useIsFetching,
  useIsMutating,
  useIsRestoring
} from '@tanstack/react-query'
import React from 'react'

import { progressBar } from './shared/components'
import { SplitLayout } from './shared/components/split-layout'
import { ToolbarButton } from './shared/components/toolbar-button'
import { component, lazy } from './shared/hocs'

const Sidebar = lazy(() => import('./sidebar'))
const IconSets = lazy(() => import('./icon-sets'))

const Loading = component(() => {
  const isLoading = [useIsFetching(), useIsMutating(), useIsRestoring()].some(
    Boolean
  )

  return (
    <React.Activity mode={isLoading ? 'visible' : 'hidden'}>
      {progressBar.default}
    </React.Activity>
  )
})

export default component(() => (
  <div style={{ position: 'relative' }}>
    <div
      style={{
        position: 'absolute',
        width: '100%',
        zIndex: 1
      }}>
      <Loading />
    </div>
    <ToolbarButton
      checked
      icon='code'
      onClick={() => {
        open('https://github.com/tt-ph4t/icon-sets')
      }}
      preventToggle
      style={{
        bottom: 'calc(var(--spacing) * 1.5)',
        left: 'calc(var(--spacing) * 1.5)',
        position: 'absolute',
        zIndex: 1
      }}
    />
    <React.Activity>
      <SplitLayout
        initialHandlePosition='25%'
        style={{
          '--border-width': '1px',

          height: 'calc(var(--height) - calc(var(--border-width) * 2))'
        }}>
        <Sidebar />
        <React.Activity>
          <IconSets />
        </React.Activity>
      </SplitLayout>
    </React.Activity>
  </div>
))
