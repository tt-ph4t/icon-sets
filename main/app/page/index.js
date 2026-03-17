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
import { omit } from 'es-toolkit'
import React from 'react'
import { preconnect } from 'react-dom'

import { Fallback } from '../components/fallback'
import { Layout } from '../components/layout'
import { Menu } from '../components/menu'
import { SplitLayout } from '../components/split-layout'
import { ToolbarButton } from '../components/toolbar-button'
import { CARD_STYLE, DATA_BASE_URL, GITHUB_REPO } from '../constants'
import { component } from '../hocs'
import { lazy } from '../hocs/lazy'
import { useEffect } from '../hooks/use-effect'
import { useRef } from '../hooks/use-ref'
import { useRemount } from '../hooks/use-remount'
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

const Settings = component(({ menu }) => {
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
                label: 'Layout',
                menu: [
                  {
                    label: 'Reverse',
                    onClick: () => {
                      settings.set(({ draft }) => {
                        draft.current.layout.reverse =
                          !draft.current.layout.reverse
                      })
                    }
                  },
                  {
                    label: 'Fullscreen',
                    onClick: () => {
                      settings.set(({ draft }) => {
                        draft.current.layout.fullscreen =
                          !draft.current.layout.fullscreen
                      })
                    }
                  }
                ]
              },
              ...menu,
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

export default useRemount.with(
  component(({ INTERNAL_REMOUNT }) => {
    preconnect(new URL(DATA_BASE_URL).origin)

    return (
      <Layout.Fullscreen
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: 'inherit',
          position: 'relative',
          width: 'inherit'
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
          <Layout.Reverse
            wrapper={children => {
              const ref = useRef()

              const layoutSettings = useSettings().useSelectValue(
                ({ draft }) => ({
                  reverse: draft.current.layout.reverse
                })
              )

              useEffect.Update(() => {
                ref.current.resetHandlePosition()
              }, [layoutSettings])

              return (
                <SplitLayout
                  initialHandlePosition={layoutSettings.reverse ? '75%' : '25%'}
                  ref={ref}
                  style={{
                    ...omit(CARD_STYLE, ['padding']),
                    get height() {
                      return `calc(var(--height) - ${this.borderWidth} * 2)`
                    }
                  }}>
                  {children}
                </SplitLayout>
              )
            }}>
            <Sidebar />
            <FilteredIconSets />
          </Layout.Reverse>
        </React.Activity>
        <div
          style={{
            alignSelf: 'center',
            bottom: 0,
            position: 'absolute'
          }}>
          <Settings
            menu={[
              {
                label: INTERNAL_REMOUNT.label,
                onClick: INTERNAL_REMOUNT
              }
            ]}
          />
        </div>
      </Layout.Fullscreen>
    )
  })
)
