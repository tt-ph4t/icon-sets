import {asyncNoop, identity, omit} from 'es-toolkit'
import {reverse} from 'es-toolkit/compat'
import React from 'react'
import {ResizableBox} from 'react-resizable'

import {SplitLayout} from '../components/split-layout'
import {component} from '../hocs'
import {useEffect} from '../hooks/use-effect'
import {useRef} from '../hooks/use-ref'
import {useSettings} from '../hooks/use-settings'
import {hasValues} from '../misc'
import {THEME} from '../misc/constants'
import {renderSlot} from '../misc/render-slot'

const DefaultReverseWrapper = component(({children}) => {
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
      style={{
        ...omit(THEME.CARD_STYLE, ['padding']),
        get height() {
          return `calc(var(--height) - ${this.borderWidth} * 2)`
        }
      }}>
      {children}
    </SplitLayout>
  )
})

export default {
  Fullscreen: component(({ref, ...props}) => {
    const settings = useSettings()

    const isFullscreen = settings.useSelectValue(
      ({draft}) => draft.layout.isFullscreen
    )

    const fullscreen = useRef.fullscreen()
    const {mergedRef} = useRef.merge(ref, fullscreen.ref)

    useEffect(() => {
      if (fullscreen.isEnabled) {
        if (fullscreen.isFullscreen === isFullscreen) return

        fullscreen[isFullscreen ? 'enterFullscreen' : 'exitFullscreen']()

        React.startTransition(() => {
          settings.set(({draft}) => {
            draft.layout.isFullscreen = fullscreen.isFullscreen
          })
        })
      }
    }, [isFullscreen, fullscreen, settings])

    return <div ref={mergedRef} {...props} />
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
        onResize={async (event, data) => {
          await onResize(event, data)

          React.startTransition(() => {
            settings.set(({draft}) => {
              draft.layout.size = data.size
            })
          })
        }}
        {...size}>
        {children}
      </ResizableBox>
    )
  }),
  Reverse: component(({children, render}) => {
    const Wrapper = hasValues(render) ? React.Fragment : DefaultReverseWrapper

    const isReverse = useSettings().useSelectValue(
      ({draft}) => draft.layout.isReverse
    )

    return renderSlot({
      bespoke: () => (
        <Wrapper>
          {(isReverse ? reverse : identity)(React.Children.toArray(children))}
        </Wrapper>
      ),
      ...render
    })
  })
}
