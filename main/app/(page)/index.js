import {isTruthy} from '@sindresorhus/is'
import {
  useIsFetching,
  useIsMutating,
  useIsRestoring
} from '@tanstack/react-query'
import {VscodeToolbarContainer} from '@vscode-elements/react-elements'
import {useNetwork} from 'ahooks'
import {omit} from 'es-toolkit'
import React from 'react'

import {Boundary} from '../components/boundary'
import {Fallback} from '../components/fallback'
import {Menu} from '../components/menu'
import {SplitLayout} from '../components/split-layout'
import {ToolbarButton} from '../components/toolbar-button'
import {component} from '../hocs'
import {useEffect} from '../hooks/use-effect'
import {useRef} from '../hooks/use-ref'
import {useRemount} from '../hooks/use-remount'
import {useSettings} from '../hooks/use-settings'
import {THEME} from '../misc/constants'
import Layout from './layout'

const Sidebar = React.lazy(() => import('./sidebar'))
const FilteredIconSets = React.lazy(() => import('./filtered-icon-sets'))

const Activity = component(() => {
  const isLoading = React.useDeferredValue(
    [useIsFetching(), useIsMutating(), useIsRestoring()].some(isTruthy)
  )

  const network = React.useDeferredValue(useNetwork())

  return (
    <React.Activity mode={isLoading || !network.online ? 'visible' : 'hidden'}>
      <Fallback
        style={
          network.online || {
            '--vscode-progressBar-background': `var(${THEME.COLORS.ERROR})`
          }
        }
      />
    </React.Activity>
  )
})

const Settings = component(({menu}) => {
  const settings = useSettings()

  return (
    <Menu
      data={[
        {
          label: 'Devtools',
          onClick: () => {
            settings.set(({draft}) => {
              draft.showDevtools = !draft.showDevtools
            })
          }
        },
        {
          label: 'Layout',
          menu: [
            {
              label: 'Reverse',
              onClick: () => {
                settings.set(({draft}) => {
                  draft.layout.reverse = !draft.layout.reverse
                })
              }
            },
            {
              label: 'Fullscreen',
              onClick: () => {
                settings.set(({draft}) => {
                  draft.layout.fullscreen = !draft.layout.fullscreen
                })
              }
            }
          ]
        },
        ...menu
      ]}
      render={<ToolbarButton icon='settings'>Settings</ToolbarButton>}
    />
  )
})

const SplitLayoutProps = {
  style: {
    ...omit(THEME.CARD_STYLE, ['padding']),
    get height() {
      return `calc(var(--height) - ${this.borderWidth} * 2)`
    }
  }
}

export default useRemount.with(
  component(({INTERNAL_REMOUNT}) => (
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
        <Activity />
      </div>
      <React.Activity>
        <Layout.Reverse
          render={{
            wrapper: children => {
              const ref = useRef()

              const layoutSettings = useSettings().useSelectValue(
                ({draft}) => ({
                  reverse: draft.layout.reverse
                })
              )

              useEffect.Update(() => {
                ref.current.resetHandlePosition()
              }, [layoutSettings.reverse])

              return (
                <SplitLayout
                  initialHandlePosition={layoutSettings.reverse ? '75%' : '25%'}
                  ref={ref}
                  {...SplitLayoutProps}>
                  {children}
                </SplitLayout>
              )
            }
          }}>
          <Boundary>
            <Sidebar />
          </Boundary>
          <Boundary>
            <FilteredIconSets />
          </Boundary>
        </Layout.Reverse>
        <VscodeToolbarContainer
          style={{
            alignSelf: 'center',
            bottom: 'calc(var(--spacing) * 2)',
            position: 'absolute'
          }}>
          <Settings menu={[{separator: true}, INTERNAL_REMOUNT.menu]} />
        </VscodeToolbarContainer>
      </React.Activity>
    </Layout.Fullscreen>
  ))
)
