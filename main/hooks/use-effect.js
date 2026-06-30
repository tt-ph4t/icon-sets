import {isFunction} from '@sindresorhus/is'
import {useAsyncEffect, useUpdateEffect} from 'ahooks'
import {mapValues, noop} from 'es-toolkit'
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
    once:
      // neu nhu re-mount thi ref dc tao moi
      (fn = noop, when = true) => {
        const ref = useRef(() => true)
        const cleanupRef = useRef()

        useEffect(() => {
          if (when && ref.current) cleanupRef.current = fn()

          return () => {
            ref.current = false

            if (isFunction(cleanupRef.current)) cleanupRef.current()
          }
        }, [fn, when])
      }
  }
)
