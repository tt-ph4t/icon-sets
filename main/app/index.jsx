import {
  useIsFetching,
  useIsMutating,
  useIsRestoring,
  useQueryClient
} from '@tanstack/react-query'
import { capitalCase } from 'change-case'
import React from 'react'

import { progressBar } from './shared/components'
import { Menu } from './shared/components/base-ui/menu'
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

export default component(() => {
  const queryClient = useQueryClient()

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
      <div
        style={{
          bottom: 'calc(var(--spacing) * 1.5)',
          left: 'calc(var(--spacing) * 1.5)',
          position: 'absolute',
          zIndex: 1
        }}>
        <Menu
          data={[
            'refetchQueries',
            'invalidateQueries',
            'resetQueries',
            'cancelQueries',
            'removeQueries'
          ].map(a => ({
            label: capitalCase(a),
            onClick: async () => {
              await queryClient[a]()
            }
          }))}
          render={
            <ToolbarButton
              checked
              icon='github'
              onClick={() => {
                open('https://github.com/tt-ph4t/icon-sets')
              }}
              preventToggle>
              GitHub
            </ToolbarButton>
          }
        />
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
