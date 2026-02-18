import {
  useIsFetching,
  useIsMutating,
  useIsRestoring,
  useQueryClient
} from '@tanstack/react-query'
import { VscodeToolbarButton } from '@vscode-elements/react-elements'
import React from 'react'

import { progressBar } from './shared/components'
import { Menu } from './shared/components/base-ui/menu'
import { SplitLayout } from './shared/components/split-layout'
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
          bottom: 0,
          left: 0,
          position: 'absolute',
          zIndex: 1
        }}>
        <Menu
          data={[
            {
              label: 'All Queries',
              menu: [
                {
                  label: 'Refetch',
                  onClick: async () => {
                    await queryClient.refetchQueries()
                  }
                },
                { separator: true },
                {
                  label: 'Invalidate',
                  onClick: async () => {
                    await queryClient.invalidateQueries()
                  }
                },
                {
                  label: 'Reset',
                  onClick: async () => {
                    await queryClient.resetQueries()
                  }
                },
                {
                  label: 'Cancel',
                  onClick: async () => {
                    await queryClient.cancelQueries()
                  }
                },
                {
                  label: 'Remove',
                  onClick: () => {
                    queryClient.removeQueries()
                  }
                }
              ]
            },
            {
              label: 'GitHub',
              onClick: () => {
                open('https://github.com/tt-ph4t/icon-sets')
              }
            }
          ]}
          render={<VscodeToolbarButton icon='menu' />}
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
