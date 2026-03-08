import { isUndefined } from '@sindresorhus/is'
import { useMemoizedFn } from 'ahooks'
import React from 'react'

import { useDeepCompareMemoize } from './use-deep-compare-memoize'

const useCallback1 = useDeepCompareMemoize.with(React.useCallback)

export const useCallback = (fn, deps) =>
  (isUndefined(deps) ? useMemoizedFn : useCallback1)(fn, deps)
