import {identity, omit} from 'es-toolkit'
import {reverse} from 'es-toolkit/compat'
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
  isFullscreen: false,
  isReverse: true,
  size: {
    height: 0,
    width: 0
  }
})

export default {
  Fullscreen: component(props => {
    const store = useStore()
    const fullscreen = useRef.fullscreen()
    const {isFullscreen} = store.useSelectValue('isFullscreen')

    useEffect(() => {
      if (fullscreen.isEnabled) {
        if (fullscreen.isFullscreen === isFullscreen) return

        fullscreen[isFullscreen ? 'enterFullscreen' : 'exitFullscreen']()

        store.set(({draft}) => {
          draft.isFullscreen = fullscreen.isFullscreen
        })
      }
    }, [isFullscreen, fullscreen])

    return (
      <Slot ref={fullscreen.ref}>
        <div {...props} />
      </Slot>
    )
  }),
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
          minConstraints={[
            useStore.initial.size.width,
            useStore.initial.size.height
          ]}
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
      <Slot
        ref={ref}
        style={{
          ...omit(THEME.CARD_STYLE, ['padding']),
          height: `calc(var(--HEIGHT) - ${THEME.CARD_STYLE.borderWidth} * 2)`
        }}>
        <SplitLayout
          initialHandlePosition={isReverse ? '73%' : '27%'}
          showSizeHint
          {...props}>
          {(isReverse ? reverse : identity)(React.Children.toArray(children))}
        </SplitLayout>
      </Slot>
    )
  }),
  useStore
}
