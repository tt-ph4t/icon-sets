import {formatForDisplay, useHotkey} from '@tanstack/react-hotkeys'
import {
  VscodeFormContainer,
  VscodeFormGroup,
  VscodeFormHelper
} from '@vscode-elements/react-elements'
import {useNetwork} from 'ahooks'
import React from 'react'

import {Boundary} from '../components/boundary'
import {Progress} from '../components/progress'
import {component} from '../hocs'
import {useIsQueryBusy} from '../hooks/use-is-query-busy'
import {useRemount} from '../hooks/use-remount'
import {THEME} from '../misc/constants'
import Layout from './layout'
import toolbar from './toolbar'
import withProviders from './with-providers'
import withQueryBoundary from './with-query-boundary'

const Sidebar = Boundary.with(React.lazy(() => import('./sidebar')))
const AllIcons = Boundary.with(React.lazy(() => import('./all-icons')))

const Loading = component(() => {
  const isQueryBusy = useIsQueryBusy()
  const network = useNetwork()

  return (
    <Progress
      style={
        network.online || {
          '--vscode-progressBar-background': `var(${THEME.COLORS.ERROR})`
        }
      }
      visible={isQueryBusy || !network.online}
    />
  )
})

const remountHotkey = 'f5'

export default withProviders(
  withQueryBoundary(
    useRemount.with(
      component(({[useRemount.key]: remount}) => {
        useHotkey(remountHotkey, remount)

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
            </React.Activity>
            <VscodeFormContainer
              style={{
                alignSelf: 'center',
                bottom: 0,
                position: 'absolute'
              }}>
              <VscodeFormGroup variant='settings-group'>
                <VscodeFormHelper>
                  {toolbar({
                    ...remount.menu,
                    description: formatForDisplay(remountHotkey)
                  })}
                </VscodeFormHelper>
              </VscodeFormGroup>
            </VscodeFormContainer>
          </Layout.Fullscreen>
        )
      })
    )
  )
)
