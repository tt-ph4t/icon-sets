import {identity, omit} from 'es-toolkit'
import {reverse} from 'es-toolkit/compat'
import React from 'react'

import {Resizable} from '../components/resizable'
import {Slot} from '../components/slot'
import {SplitLayout} from '../components/split-layout'
import {component} from '../hocs'
import {useEffect} from '../hooks/use-effect'
import {useRef} from '../hooks/use-ref'
import {useSettings} from '../hooks/use-settings'
import {THEME} from '../misc/constants'

export default {
  Fullscreen: component(props => {
    const settings = useSettings()
    const fullscreen = useRef.fullscreen()

    const isFullscreen = settings.useSelectValue(
      ({draft}) => draft.layout.isFullscreen
    )

    useEffect(() => {
      if (fullscreen.isEnabled) {
        if (fullscreen.isFullscreen === isFullscreen) return

        fullscreen[isFullscreen ? 'enterFullscreen' : 'exitFullscreen']()

        settings.set(({draft}) => {
          draft.layout.isFullscreen = fullscreen.isFullscreen
        })
      }
    }, [isFullscreen, fullscreen, settings])

    return (
      <Slot ref={fullscreen.ref}>
        <div {...props} />
      </Slot>
    )
  }),
  Resizable: component(props => {
    const settings = useSettings()
    const maxConstraints = useRef.size()
    const size = settings.useSelectValue(({draft}) => draft.layout.size)

    useEffect(() => {
      settings.set(({draft}) => {
        draft.layout.size = {
          height:
            maxConstraints.height *
            (maxConstraints.width >= THEME.BREAKPOINTS['2XL'] ? 0.86 : 0.96),
          width:
            maxConstraints.width *
            (maxConstraints.width >= THEME.BREAKPOINTS['2XL'] ? 0.8 : 0.95)
        }
      })
    }, [maxConstraints, settings])

    return (
      <Slot
        onResize={(...[, {size}]) => {
          settings.set(({draft}) => {
            draft.layout.size = size
          })
        }}>
        <Resizable
          as={Resizable.Box}
          maxConstraints={[maxConstraints.width, maxConstraints.height]}
          minConstraints={[
            useSettings.initial.layout.size.width,
            useSettings.initial.layout.size.height
          ]}
          {...size}
          {...props}
        />
      </Slot>
    )
  }),
  Split: component(({children, ...props}) => {
    const ref = useRef()

    const isReverse = useSettings().useSelectValue(
      ({draft}) => draft.layout.isReverse
    )

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
  })
}
