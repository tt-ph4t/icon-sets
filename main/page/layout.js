import {omit} from 'es-toolkit'
import {pipe, reverse, take} from 'es-toolkit/fp'
import React from 'react'

import {Resizable} from '../components/resizable'
import {Slot} from '../components/slot'
import {SplitLayout} from '../components/split-layout'
import {ToolbarButton} from '../components/toolbar-button'
import {component} from '../hocs'
import {useEffect} from '../hooks/use-effect'
import {useRef} from '../hooks/use-ref'
import {useSize} from '../hooks/use-size'
import {useUpdateEffect} from '../hooks/use-update-effect'
import {THEME} from '../misc/constants'
import {withImmerAtom} from '../misc/with-immer-atom'

const useStore = withImmerAtom({
  sidebarRight: true,
  size: {
    height: 0,
    width: 0
  }
})

const style = {
  ...omit(THEME.CARD_STYLE, ['padding']),
  height: `calc(var(--HEIGHT) - ${THEME.CARD_STYLE.borderWidth} * 2)`
}

export default {
  Resizable: component(props => {
    const store = useStore()
    const maxConstraints = useSize()
    const {size} = store.useSelectValue('size')

    useEffect(() => {
      store.set(({draft}) => {
        draft.size = {
          height:
            maxConstraints.height *
            (maxConstraints.width >= THEME.BREAKPOINTS['2XL'] ? 0.86 : 0.96),
          width:
            maxConstraints.width *
            (maxConstraints.width >= THEME.BREAKPOINTS['2XL'] ? 0.8 : 0.95)
        }
      })
    }, [maxConstraints])

    return (
      <Slot
        onResize={(...[, {size}]) => {
          store.set(({draft}) => {
            draft.size = size
          })
        }}>
        <Resizable.Box
          maxConstraints={[maxConstraints.width, maxConstraints.height]}
          {...size}
          {...props}
        />
      </Slot>
    )
  }),
  SidebarRightToggle: component(props => {
    const store = useStore()
    const {sidebarRight} = store.useSelectValue('sidebarRight')

    return (
      <Slot
        onClick={() => {
          store.toggle('sidebarRight')
        }}>
        <ToolbarButton
          icon={sidebarRight ? 'layout-sidebar-left' : 'layout-sidebar-right'}
          {...props}
        />
      </Slot>
    )
  }),
  Split: component(({children, ...props}) => {
    const ref = useRef()
    const {sidebarRight} = useStore().useSelectValue('sidebarRight')

    useUpdateEffect(() => {
      ref.current.resetHandlePosition()
    }, [sidebarRight])

    return (
      <Slot ref={ref} style={style}>
        <SplitLayout
          initialHandlePosition={sidebarRight ? '73%' : '27%'}
          sizeHint
          {...props}>
          {pipe(
            React.Children.toArray(children),
            (sidebarRight ? reverse : take)(Infinity)
          )}
        </SplitLayout>
      </Slot>
    )
  }),
  useStore
}
