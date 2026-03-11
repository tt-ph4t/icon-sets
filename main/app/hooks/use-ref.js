import { useFullscreen, useSize } from 'ahooks'
import React from 'react'

import { useState } from './use-state'

// https://github.com/Shopify/quilt/blob/d98672060fc724f3fe7af9a25a0845b8d7c0774a/packages/react-hooks/src/hooks/lazy-ref.ts
export const useRef = Object.assign(
  getValue => {
    const [state] = useState(getValue)

    return React.useRef(state)
  },
  {
    Fullscreen: options => {
      const ref = useRef()
      const [isFullscreen, rest] = useFullscreen(ref, options)

      return { isFullscreen, ref, ...rest }
    },
    Size: () => {
      const ref = useRef()

      return {
        ref,
        ...React.useDeferredValue(
          useSize(() => ref.current ?? document.querySelector('body'))
        )
      }
    }
  }
)
