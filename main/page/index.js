import {useHotkey} from '@tanstack/react-hotkeys'
import {
  VscodeFormContainer,
  VscodeFormGroup,
  VscodeFormHelper
} from '@vscode-elements/react-elements'
import {useNetwork} from 'ahooks'
import React from 'react'
import root from 'react-shadow'

import {Boundary} from '../components/boundary'
import {ProgressBar} from '../components/progress'
import {Slot} from '../components/slot'
import {component} from '../hocs'
import {useIsQueryBusy} from '../hooks/use-is-query-busy'
import {useRemount} from '../hooks/use-remount'
import {THEME} from '../misc/constants'
import Context from './context'
import Layout from './layout'
import Toolbar from './toolbar'
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
  useRemount.with(
    withQueryBoundary(
      component(({[useRemount.key]: remount}) => {
        useHotkey('f5', remount)

        return (
          <Context remount={remount}>
            <Layout.Resizable>
              <root.div
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
                      <Toolbar />
                    </VscodeFormHelper>
                  </VscodeFormGroup>
                </VscodeFormContainer>
              </root.div>
            </Layout.Resizable>
          </Context>
        )
      })
    )
  )
)
