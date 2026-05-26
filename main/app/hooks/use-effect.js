import {useAsyncEffect, useUpdateEffect} from 'ahooks'
import {mapValues} from 'es-toolkit'
import React from 'react'

import {useDeepCompareMemoize} from './use-deep-compare-memoize'
import {useRef} from './use-ref'

export const useEffect = Object.assign(
  useDeepCompareMemoize.with(React.useEffect),
  {
    ...mapValues(
      {
        async: useAsyncEffect,
        update: useUpdateEffect
      },
      useDeepCompareMemoize.with
    ),
    once: (fn, when = true) => {
      const ref = useRef(() => true)

      let cleanup

      useEffect(() => {
        if (when && ref.current) cleanup = fn()

        return () => {
          ref.current = false

          cleanup?.()
        }
      }, [fn, when])
    }
  }
)
