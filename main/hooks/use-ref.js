import {useMergedRefs, useMergedRefsN} from '@base-ui/utils/useMergedRefs'
import {useFullscreen, useSize, useUnmount} from 'ahooks'
import {noop} from 'es-toolkit'
import {castArray} from 'es-toolkit/compat'
import React from 'react'

import {useState} from './use-state'

const defaultSize = {
  target: document.querySelector('body'),
  value: {
    height: 0,
    width: 0
  }
}

const internalUseMergedRefs = refs => useMergedRefs(...castArray(refs))

export const useRef = Object.assign(
  (getValue = noop) => {
    const // https://github.com/Shopify/quilt/blob/d98672060fc724f3fe7af9a25a0845b8d7c0774a/packages/react-hooks/src/hooks/lazy-ref.ts
      ref = React.useRef(useState(() => getValue())[0])

    useUnmount(() => {
      React.startTransition(() => {
        ref.current = noop()
      })
    })

    return ref
  },
  {
    fullscreen: options => {
      const ref = useRef()
      const [isFullscreen, rest] = useFullscreen(ref, options)

      return {
        isFullscreen,
        ref,
        ...rest
      }
    },
    merge: (...refs) => ({
      mergedRef: (refs.length <= 4 ? internalUseMergedRefs : useMergedRefsN)(
        refs
      )
    }),
    size: () => {
      const ref = useRef()

      return {
        ref,
        ...React.useDeferredValue(
          useSize(() => ref.current ?? defaultSize.target)
        )
      }
    }
  }
)
