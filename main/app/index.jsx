import { isTruthy } from '@sindresorhus/is'
import {
  useIsFetching,
  useIsMutating,
  useIsRestoring
} from '@tanstack/react-query'
import {
  VscodeFormContainer,
  VscodeFormGroup,
  VscodeFormHelper
} from '@vscode-elements/react-elements'
import { identity } from 'es-toolkit'
import { reverse } from 'es-toolkit/compat'
import React from 'react'
import { preconnect } from 'react-dom'

import { progressBar } from './shared/components'
import { Menu } from './shared/components/menu'
import { SplitLayout } from './shared/components/split-layout'
import { ToolbarButton } from './shared/components/toolbar-button'
import { DATA_BASE_URL, GITHUB_REPO } from './shared/constants'
import { component, lazy } from './shared/hocs'
import { useRef } from './shared/hooks/use-ref'
import { useSettings } from './shared/hooks/use-settings'
import { useUpdateEffect } from './shared/hooks/use-update-effect'

const Sidebar = lazy(() => import('./sidebar'))
const FilteredIconSets = lazy(() => import('./filtered-icon-sets'))

const App = component(() => {
  const ref = useRef()

  const reverseLayout = useSettings().useSelectValue(
    ({ draft }) => draft.current.reverseLayout
  )

  useUpdateEffect(() => {
    ref.current.resetHandlePosition()
  }, [reverseLayout])

  return (
    <SplitLayout
      initialHandlePosition={reverseLayout ? '75%' : '25%'}
      ref={ref}
      style={{
        '--border-width': '1px',

        height: 'calc(var(--height) - calc(var(--border-width) * 2))'
      }}>
      {(reverseLayout ? reverse : identity)([
        <Sidebar key={React.useId()} />,
        <React.Activity key={React.useId()}>
          <FilteredIconSets />
        </React.Activity>
      ])}
    </SplitLayout>
  )
})

const Loading = component(() => {
  const isLoading = [useIsFetching(), useIsMutating(), useIsRestoring()].some(
    isTruthy
  )

  return (
    <React.Activity mode={isLoading ? 'visible' : 'hidden'}>
      {progressBar.default}
    </React.Activity>
  )
})

const Settings = component(() => {
  const settings = useSettings()

  return (
    <VscodeFormContainer>
      <VscodeFormGroup style={{ paddingBottom: 12 }} variant='settings-group'>
        <VscodeFormHelper>
          <Menu
            data={[
              {
                label: 'Devtools',
                onClick: () => {
                  settings.set(({ draft }) => {
                    draft.current.showDevtools = !draft.current.showDevtools
                  })
                }
              },
              {
                label: 'Reverse Layout',
                onClick: () => {
                  settings.set(({ draft }) => {
                    draft.current.reverseLayout = !draft.current.reverseLayout
                  })
                }
              },
              { separator: true },
              {
                label: 'GitHub',
                onClick: () => {
                  open(`https://github.com/${GITHUB_REPO}`)
                }
              }
            ]}
            render={<ToolbarButton icon='settings'>Settings</ToolbarButton>}
          />
        </VscodeFormHelper>
      </VscodeFormGroup>
    </VscodeFormContainer>
  )
})

export default component(() => {
  preconnect(new URL(DATA_BASE_URL).origin)

  return (
    <>
      <div
        style={{
          position: 'absolute',
          width: '100%',
          zIndex: 1
        }}>
        <Loading />
      </div>
      <React.Activity>
        <App />
      </React.Activity>
      <div
        style={{
          alignSelf: 'center',
          bottom: 0,
          position: 'absolute'
        }}>
        <Settings />
      </div>
    </>
  )
})
