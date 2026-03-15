import { identity } from 'es-toolkit'
import { reverse } from 'es-toolkit/compat'
import React from 'react'
import { ResizableBox } from 'react-resizable'
import { renderSlot } from 'render-slot'

import { component } from '../hocs'
import { useEffect } from '../hooks/use-effect'
import { useRef } from '../hooks/use-ref'
import { useSettings } from '../hooks/use-settings'

export const Layout = Object.assign(
  component(({ children }) => {
    const settings = useSettings()
    const maxSize = useRef.Size()

    const layoutSettings = settings.useSelectValue(({ draft }) => ({
      size: draft.current.layout.size
    }))

    useEffect(() => {
      settings.set(({ draft }) => {
        draft.current.layout.size = {
          height: maxSize.height * 0.86,
          width: maxSize.width * 0.8
        }
      })
    }, [maxSize])

    return (
      <ResizableBox
        maxConstraints={[maxSize.width, maxSize.height]}
        minConstraints={[
          settings.init.current.layout.size.width,
          settings.init.current.layout.size.height
        ]}
        onResize={(event, data) => {
          settings.set(({ draft }) => {
            draft.current.layout.size = data.size
          })
        }}
        {...layoutSettings.size}>
        {children}
      </ResizableBox>
    )
  }),
  {
    Fullscreen: component(({ ref, ...props }) => {
      const settings = useSettings()

      const layoutSettings = settings.useSelectValue(({ draft }) => ({
        fullscreen: draft.current.layout.fullscreen
      }))

      const fullscreen = useRef.Fullscreen()
      const mergedRef = useRef.Merge(ref, fullscreen.ref)

      useEffect(() => {
        if (fullscreen.isEnabled) {
          if (fullscreen.isFullscreen === layoutSettings.fullscreen) return

          fullscreen[
            layoutSettings.fullscreen ? 'enterFullscreen' : 'exitFullscreen'
          ]()

          settings.set(({ draft }) => {
            draft.current.layout.fullscreen = fullscreen.isFullscreen
          })
        }
      }, [layoutSettings, fullscreen])

      return <div ref={mergedRef} {...props} />
    }),
    Reverse: component(({ children, ...props }) => {
      const layoutSettings = useSettings().useSelectValue(({ draft }) => ({
        reverse: draft.current.layout.reverse
      }))

      return renderSlot({
        bespoke: () =>
          (layoutSettings.reverse ? reverse : identity)(
            React.Children.toArray(children)
          ),
        ...props
      })
    })
  }
)
