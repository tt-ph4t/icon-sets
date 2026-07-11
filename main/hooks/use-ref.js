import {useMergedRefs} from '@base-ui/utils/useMergedRefs'
import {useFullscreen, useSize, useUnmount} from 'ahooks'
import {noop, spread} from 'es-toolkit'
import React from 'react'

import {useState} from './use-state'

const bodyElement = document.querySelector('body')
const defaultGetValue = noop
const internalUseMergedRefs = spread(useMergedRefs)

export const useRef = Object.assign(
  (getValue = defaultGetValue) => {
    const // https://github.com/Shopify/quilt/blob/d98672060fc724f3fe7af9a25a0845b8d7c0774a/packages/react-hooks/src/hooks/lazy-ref.ts
      ref = React.useRef(useState(() => getValue())[0])

    useUnmount(() => {
      ref.current = defaultGetValue()
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
    size: () => {
      const ref = useRef()

      return {
        ref,
        ...React.useDeferredValue(useSize(() => ref.current ?? bodyElement))
      }
    }
  }
)
