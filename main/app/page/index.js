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

import { Fallback } from '../components/fallback'
import { Menu } from '../components/menu'
import { SplitLayout } from '../components/split-layout'
import { ToolbarButton } from '../components/toolbar-button'
import { DATA_BASE_URL, GITHUB_REPO } from '../constants'
import { component } from '../hocs'
import { lazy } from '../hocs/lazy'
import { useEffect } from '../hooks/use-effect'
import { useRef } from '../hooks/use-ref'
import { useSettings } from '../hooks/use-settings'

const Sidebar = lazy(() => import('./sidebar'))
const FilteredIconSets = lazy(() => import('./filtered-icon-sets'))

const Loading = component(() => {
  const isLoading = [useIsFetching(), useIsMutating(), useIsRestoring()].some(
    isTruthy
  )

  return (
    <React.Activity mode={isLoading ? 'visible' : 'hidden'}>
      <Fallback />
    </React.Activity>
  )
})

const Settings = Object.assign(
  component(() => {
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
                {
                  label: 'UNSTABLE_FULLSCREEN',
                  onClick: () => {
                    settings.set(({ draft }) => {
                      draft.current.isFullscreen = !draft.current.isFullscreen
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
  }),
  {
    Fullscreen: component(props => {
      const settings = useSettings()

      const isFullscreen = settings.useSelectValue(
        ({ draft }) => draft.current.isFullscreen
      )

      const fullscreen = useRef.Fullscreen()

      useEffect(() => {
        if (fullscreen.isEnabled) {
          if (fullscreen.isFullscreen === isFullscreen) return

          fullscreen[isFullscreen ? 'enterFullscreen' : 'exitFullscreen']()

          settings.set(({ draft }) => {
            draft.current.isFullscreen = fullscreen.isFullscreen
          })
        }
      }, [isFullscreen, fullscreen])

      return <div ref={fullscreen.ref} {...props} />
    }),
    ReverseLayout: component(({ children }) => {
      const ref = useRef()

      const reverseLayout = useSettings().useSelectValue(
        ({ draft }) => draft.current.reverseLayout
      )

      useEffect.Update(() => {
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
          {(reverseLayout ? reverse : identity)(
            React.Children.toArray(children)
          )}
        </SplitLayout>
      )
    })
  }
)

export default component(() => {
  preconnect(new URL(DATA_BASE_URL).origin)

  return (
    <Settings.Fullscreen
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
      <div
        style={{
          position: 'absolute',
          width: '100%',
          zIndex: 1
        }}>
        <Loading />
      </div>
      <React.Activity>
        <Settings.ReverseLayout>
          <Sidebar />
          <FilteredIconSets />
        </Settings.ReverseLayout>
      </React.Activity>
      <div
        style={{
          alignSelf: 'center',
          bottom: 0,
          position: 'absolute'
        }}>
        <Settings />
      </div>
    </Settings.Fullscreen>
  )
})
