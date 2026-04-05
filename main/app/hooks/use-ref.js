import {composeRefs} from '@radix-ui/react-compose-refs'
import {useFullscreen, useSize, useUnmount} from 'ahooks'
import {noop} from 'es-toolkit'
import React from 'react'

import {useCallback} from './use-callback'
import {useState} from './use-state'

const bodyElement = document.querySelector('body')

// https://github.com/Shopify/quilt/blob/d98672060fc724f3fe7af9a25a0845b8d7c0774a/packages/react-hooks/src/hooks/lazy-ref.ts
export const useRef = Object.assign(
  (getValue = noop) => {
    const ref = React.useRef(useState(() => getValue())[0])

    useUnmount(() => {
      React.startTransition(() => {
        ref.current = noop()
      })
    })

    return ref
  },
  {
    Fullscreen: options => {
      const ref = useRef()
      const [isFullscreen, rest] = useFullscreen(ref, options)

      return {isFullscreen, ref, ...rest}
    },
    Merge:
      // https://github.com/radix-ui/primitives/blob/22473d16404bfd446305db5b6c9308aece99fdec/packages/react/compose-refs/src/compose-refs.tsx#L55
      (...refs) => useCallback(composeRefs(...refs), refs),
    Size: () => {
      const ref = useRef()

      return {
        ref,
        ...React.useDeferredValue(useSize(() => ref.current ?? bodyElement))
      }
    }
  }
)
