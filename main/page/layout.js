import {omit} from 'es-toolkit'
import {pipe, reverse, take} from 'es-toolkit/fp'
import React from 'react'

import {Resizable} from '../components/resizable'
import {Slot} from '../components/slot'
import {SplitLayout} from '../components/split-layout'
import {component} from '../hocs'
import {useEffect} from '../hooks/use-effect'
import {useRef} from '../hooks/use-ref'
import {THEME} from '../misc/constants'
import {withImmerAtom} from '../misc/with-immer-atom'

const useStore = withImmerAtom({
  isReverse: true,
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
    const maxConstraints = useRef.size()
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
  Split: component(({children, ...props}) => {
    const ref = useRef()
    const {isReverse} = useStore().useSelectValue('isReverse')

    useEffect.update(() => {
      ref.current.resetHandlePosition()
    }, [isReverse])

    return (
      <Slot ref={ref} style={style}>
        <SplitLayout
          initialHandlePosition={isReverse ? '73%' : '27%'}
          sizeHint
          {...props}>
          {pipe(
            React.Children.toArray(children),
            (isReverse ? reverse : take)(Infinity)
          )}
        </SplitLayout>
      </Slot>
    )
  }),
  useStore
}
