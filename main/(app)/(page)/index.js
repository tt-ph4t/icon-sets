import {isTruthy} from '@sindresorhus/is'
import {useQuery} from '@tanstack/react-query'
import {VscodeToolbarContainer} from '@vscode-elements/react-elements'
import {useNetwork} from 'ahooks'
import React from 'react'

import {Boundary} from '../components/boundary'
import {Fallback} from '../components/fallback'
import {Menu} from '../components/menu'
import {ProgressRing} from '../components/progress-ring'
import {ToolbarButton} from '../components/toolbar-button'
import {component} from '../hocs'
import {useRemount} from '../hooks/use-remount'
import {useSettings} from '../hooks/use-settings'
import {
  DEFAULT_QUERY_OPTIONS,
  REACT_QUERY_STATUS_HOOKS,
  THEME
} from '../misc/constants'
import IconQueries from './icon-queries'
import Layout from './layout'
import QueryClient from './query-client'

const Sidebar = Boundary.lazy(() => import('./sidebar'))
const FilteredIconSets = Boundary.lazy(() => import('./filtered-icon-sets'))

const GlobalActivity = component(() => {
  const isLoading = REACT_QUERY_STATUS_HOOKS.map(hook => hook()).some(isTruthy)
  const network = useNetwork()

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

const DataLoading = component(() => {
  const query = useQuery(DEFAULT_QUERY_OPTIONS)

  return (
    <React.Activity mode={query.isPending ? 'visible' : 'hidden'}>
      <ProgressRing>Loading data</ProgressRing>
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
              draft.isDev = !draft.isDev
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
                  draft.layout.isReverse = !draft.layout.isReverse
                })
              }
            },
            {
              label: 'Fullscreen',
              onClick: () => {
                settings.set(({draft}) => {
                  draft.layout.isFullscreen = !draft.layout.isFullscreen
                })
              }
            }
          ]
        },
        ...menu
      ]}
      render={<ToolbarButton icon='settings' />}
    />
  )
})

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
        <GlobalActivity />
      </div>
      <div
        style={{
          alignContent: 'center',
          inset: '0',
          justifySelf: 'center',
          pointerEvents: 'none',
          position: 'absolute',
          zIndex: 1
        }}>
        <div
          style={{
            pointerEvents: 'auto'
          }}>
          <DataLoading />
        </div>
      </div>
      <React.Activity>
        <Layout.Reverse>
          <Sidebar />
          <FilteredIconSets />
        </Layout.Reverse>
        <VscodeToolbarContainer
          style={{
            alignSelf: 'center',
            bottom: 'calc(var(--spacing) * 2)',
            position: 'absolute'
          }}>
          <Settings
            menu={[
              {
                separator: true
              },
              INTERNAL_REMOUNT.menu
            ]}
          />
          <React.Activity>
            <IconQueries />
            <QueryClient />
          </React.Activity>
        </VscodeToolbarContainer>
      </React.Activity>
    </Layout.Fullscreen>
  ))
)
