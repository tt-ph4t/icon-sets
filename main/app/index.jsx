import {
  useIsFetching,
  useIsMutating,
  useIsRestoring
} from '@tanstack/react-query'
import React from 'react'
import { preconnect } from 'react-dom'

import { progressBar } from './shared/components'
import { SplitLayout } from './shared/components/split-layout'
import { DATA_BASE_URL } from './shared/constants'
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

export default component(() => {
  preconnect(new URL(DATA_BASE_URL).origin)

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          width: '100%',
          zIndex: 1
        }}>
        <Loading />
      </div>
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
  )
})
