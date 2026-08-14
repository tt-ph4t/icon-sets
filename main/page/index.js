import {useHotkey} from '@tanstack/react-hotkeys'
import {
  VscodeFormContainer,
  VscodeFormGroup,
  VscodeFormHelper
} from '@vscode-elements/react-elements'
import {useNetwork} from 'ahooks'
import React from 'react'

import {Boundary} from '../components/boundary'
import {Kbd} from '../components/kbd'
import {ProgressBar} from '../components/progress'
import {Slot} from '../components/slot'
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

const Loading = component(props => {
  const isQueryBusy = useIsQueryBusy()
  const network = useNetwork()

  return (
    <Slot
      style={
        network.online || {
          '--vscode-progressBar-background': THEME.COLORS.ERROR
        }
      }>
      <ProgressBar.Global visible={isQueryBusy || !network.online} {...props} />
    </Slot>
  )
})

export default withProviders(
  withQueryBoundary(
    useRemount.with(
      component(({[useRemount.key]: remount}) => {
        useHotkey(remount.hotkey, remount)

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
                    description: Kbd.text(remount.hotkey)
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
