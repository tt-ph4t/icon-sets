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
      const cleanupRef = useRef()

      useEffect(() => {
        if (when && ref.current) cleanupRef.current = fn()

        return () => {
          ref.current = false

          cleanupRef.current?.()
        }
      }, [fn, when])
    }
  }
)
