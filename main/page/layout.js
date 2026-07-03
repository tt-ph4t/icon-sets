import {asyncNoop, identity, omit} from 'es-toolkit'
import {reverse} from 'es-toolkit/compat'
import React from 'react'
import {ResizableBox} from 'react-resizable'

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

    return <div ref={fullscreen.ref} {...props} />
  }),
  Resizable: component(({children, onResize = asyncNoop}) => {
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
      <ResizableBox
        maxConstraints={[maxConstraints.width, maxConstraints.height]}
        minConstraints={[
          useSettings.initial.layout.size.width,
          useSettings.initial.layout.size.height
        ]}
        onResize={async (...args) => {
          await onResize(...args)

          React.startTransition(() => {
            settings.set(({draft}) => {
              draft.layout.size = args[1].size
            })
          })
        }}
        {...size}>
        {children}
      </ResizableBox>
    )
  }),
  Split: component(({children}) => {
    const ref = useRef()

    const isReverse = useSettings().useSelectValue(
      ({draft}) => draft.layout.isReverse
    )

    useEffect.update(() => {
      ref.current.resetHandlePosition()
    }, [isReverse])

    return (
      <SplitLayout
        initialHandlePosition={isReverse ? '73%' : '27%'}
        ref={ref}
        showSizeHint
        style={{
          ...omit(THEME.CARD_STYLE, ['padding']),
          height: `calc(var(--HEIGHT) - ${THEME.CARD_STYLE.borderWidth} * 2)`
        }}>
        {(isReverse ? reverse : identity)(React.Children.toArray(children))}
      </SplitLayout>
    )
  })
}
