import { isUndefined } from '@sindresorhus/is'
import { useCreation } from 'ahooks'
import React from 'react'

import { withDeepCompareDeps } from './use-deep-compare-memoize'
import { useRef } from './use-ref'

const useCreation1 = withDeepCompareDeps(useCreation)
const useMemo1 = withDeepCompareDeps(React.useMemo)

export const useMemo = Object.assign(
  (fn, deps) => {
    const hasDeps = !isUndefined(deps)
    const forceRecompute = deps === useMemo.forceRecompute

    const value = (
      forceRecompute
        ? useMemo1
        : hasDeps
          ? useCreation1
          : // https://garden.bradwoods.io/notes/javascript/react/memo-use-memo-use-callback
            // If you need a reference to an object or array that doesn't require recalculation,
            // useRef could be a better choice
            useRef
    )(fn, forceRecompute ? undefined : deps)

    return forceRecompute || hasDeps ? value : value.current
  },
  { forceRecompute: Symbol() }
)
