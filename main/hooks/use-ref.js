import {useFullscreen, useSize, useUnmount} from 'ahooks'
import React from 'react'

const bodyElement = document.querySelector('body')

const defaults = {
  ref: {
    getValue: () => defaults.ref.value,
    // eslint-disable-next-line unicorn/no-null
    value: null
  }
}

export const useRef = Object.assign(
  (getValue = defaults.ref.getValue) => {
    const ref =
      // https://github.com/Shopify/quilt/blob/d98672060fc724f3fe7af9a25a0845b8d7c0774a/packages/react-hooks/src/hooks/lazy-ref.ts
      // https://github.com/SukkaW/foxact/blob/e9438f0980a2094f0d4b8065c339a3e72ba477d8/packages/foxact/src/use-singleton/index.ts
      React.useRef(defaults.ref.value)

    if (ref.current === defaults.ref.value) ref.current = getValue()

    useUnmount(() => {
      ref.current = defaults.ref.value
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
