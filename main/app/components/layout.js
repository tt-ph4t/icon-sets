import {asyncNoop, identity} from 'es-toolkit'
import {reverse} from 'es-toolkit/compat'
import React from 'react'
import {ResizableBox} from 'react-resizable'
import {renderSlot} from 'render-slot'

import {BREAKPOINTS} from '../constants'
import {component} from '../hocs'
import {useEffect} from '../hooks/use-effect'
import {useRef} from '../hooks/use-ref'
import {useSettings} from '../hooks/use-settings'

export const Layout = Object.assign(
  component(({children, onResize = asyncNoop}) => {
    const settings = useSettings()
    const maxSize = useRef.Size()

    const layoutSettings = settings.useSelectValue(({draft}) => ({
      size: draft.layout.size
    }))

    useEffect(() => {
      settings.set(({draft}) => {
        draft.layout.size = {
          height:
            maxSize.height *
            (maxSize.width >= BREAKPOINTS['2XL'] ? 0.86 : 0.96),
          width:
            maxSize.width * (maxSize.width >= BREAKPOINTS['2XL'] ? 0.8 : 0.95)
        }
      })
    }, [maxSize])

    return (
      <ResizableBox
        maxConstraints={[maxSize.width, maxSize.height]}
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
        {...layoutSettings.size}>
        {children}
      </ResizableBox>
    )
  }),
  {
    Fullscreen: component(({ref, ...props}) => {
      const settings = useSettings()

      const layoutSettings = settings.useSelectValue(({draft}) => ({
        fullscreen: draft.layout.fullscreen
      }))

      const fullscreen = useRef.Fullscreen()
      const mergedRef = useRef.Merge(ref, fullscreen.ref)

      useEffect(() => {
        if (fullscreen.isEnabled) {
          if (fullscreen.isFullscreen === layoutSettings.fullscreen) return

          fullscreen[
            layoutSettings.fullscreen ? 'enterFullscreen' : 'exitFullscreen'
          ]()

          settings.set(({draft}) => {
            draft.layout.fullscreen = fullscreen.isFullscreen
          })
        }
      }, [layoutSettings.fullscreen, fullscreen])

      return <div ref={mergedRef} {...props} />
    }),
    Reverse: component(({children, render}) => {
      const layoutSettings = useSettings().useSelectValue(({draft}) => ({
        reverse: draft.layout.reverse
      }))

      return renderSlot({
        bespoke: () =>
          (layoutSettings.reverse ? reverse : identity)(
            React.Children.toArray(children)
          ),
        ...render
      })
    })
  }
)
