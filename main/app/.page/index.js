import {isTruthy} from '@sindresorhus/is'
import {useQuery} from '@tanstack/react-query'
import {
  VscodeFormContainer,
  VscodeFormGroup,
  VscodeFormHelper,
  VscodeToolbarContainer
} from '@vscode-elements/react-elements'
import {useNetwork} from 'ahooks'
import React from 'react'

import {Boundary} from '../components/boundary'
import {Fallback} from '../components/fallback'
import {IconGrid} from '../components/icon-grid'
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
import AllIconQueries from './all-icon-queries'
import Layout from './layout'

const Sidebar = Boundary.with(React.lazy(() => import('./sidebar')))
const AllIcons = Boundary.with(React.lazy(() => import('./all-icons')))

const Loading = Object.assign(
  component(() => {
    const isLoading = REACT_QUERY_STATUS_HOOKS.map(hook => hook()).some(
      isTruthy
    )
    const network = useNetwork()

    return (
      <React.Activity
        mode={isLoading || !network.online ? 'visible' : 'hidden'}>
        <Fallback
          style={
            network.online || {
              '--vscode-progressBar-background': `var(${THEME.COLORS.ERROR})`
            }
          }
        />
      </React.Activity>
    )
  }),
  {
    Data: component(() => {
      const query = useQuery(DEFAULT_QUERY_OPTIONS)

      return (
        <React.Activity mode={query.isPending ? 'visible' : 'hidden'}>
          <ProgressRing>Loading data</ProgressRing>
        </React.Activity>
      )
    })
  }
)

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
        <Loading />
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
          <Loading.Data />
        </div>
      </div>
      <React.Activity>
        <Layout.Reverse>
          <Sidebar />
          <AllIcons />
        </Layout.Reverse>
        <VscodeFormContainer
          style={{
            alignSelf: 'center',
            bottom: 0,
            position: 'absolute'
          }}>
          <VscodeFormGroup variant='settings-group'>
            <VscodeFormHelper>
              <VscodeToolbarContainer>
                <Settings
                  menu={[
                    {
                      separator: true
                    },
                    INTERNAL_REMOUNT.menu
                  ]}
                />
                <IconGrid.Search>
                  <AllIconQueries />
                </IconGrid.Search>
              </VscodeToolbarContainer>
            </VscodeFormHelper>
          </VscodeFormGroup>
        </VscodeFormContainer>
      </React.Activity>
    </Layout.Fullscreen>
  ))
)
