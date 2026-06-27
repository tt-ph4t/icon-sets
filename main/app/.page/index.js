import {isTruthy} from '@sindresorhus/is'
import {formatForDisplay, useHotkey} from '@tanstack/react-hotkeys'
import {
  VscodeFormContainer,
  VscodeFormGroup,
  VscodeFormHelper,
  VscodeToolbarContainer
} from '@vscode-elements/react-elements'
import {useNetwork} from 'ahooks'
import React from 'react'

import {Boundary} from '../components/boundary'
import {Progress} from '../components/progress'
import {component} from '../hocs'
import {useRemount} from '../hooks/use-remount'
import {REACT_QUERY_STATUS_HOOKS, THEME} from '../misc/constants'
import Layout from './layout'
import Toolbar from './toolbar'
import withProviders from './with-providers'
import withQueryBoundary from './with-query-boundary'

const Sidebar = Boundary.with(React.lazy(() => import('./sidebar')))
const AllIcons = Boundary.with(React.lazy(() => import('./all-icons')))

const Loading = component(() => {
  const isLoading = REACT_QUERY_STATUS_HOOKS.map(hook => hook()).some(isTruthy)

  const network = useNetwork()

  return (
    <Progress
      style={
        network.online || {
          '--vscode-progressBar-background': `var(${THEME.COLORS.ERROR})`
        }
      }
      visible={isLoading || !network.online}
    />
  )
})

const remountHotkey = 'f5'

export default withProviders(
  withQueryBoundary(
    useRemount.with(
      component(({INTERNAL_REMOUNT}) => {
        useHotkey(remountHotkey, INTERNAL_REMOUNT)

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
              <Layout.Split>
                <Sidebar />
                <AllIcons />
              </Layout.Split>
              <VscodeFormContainer
                style={{
                  alignSelf: 'center',
                  bottom: 0,
                  position: 'absolute'
                }}>
                <VscodeFormGroup variant='settings-group'>
                  <VscodeFormHelper>
                    <VscodeToolbarContainer>
                      <Toolbar
                        menu={{
                          ...INTERNAL_REMOUNT.menu,
                          description: formatForDisplay(remountHotkey)
                        }}
                      />
                    </VscodeToolbarContainer>
                  </VscodeFormHelper>
                </VscodeFormGroup>
              </VscodeFormContainer>
            </React.Activity>
          </Layout.Fullscreen>
        )
      })
    )
  )
)
