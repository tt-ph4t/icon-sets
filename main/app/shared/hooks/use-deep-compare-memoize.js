import { isPrimitive, isUndefined } from '@sindresorhus/is'
import { useCreation } from 'ahooks'
import { castArray } from 'es-toolkit/compat'

import { isEqual } from '../utils'
import { useRef } from './use-ref'

export const useDeepCompareMemoize =
  // https://github.com/sandiiarov/use-deep-compare/blob/07a9b586394d883f354648f8487b256f7c6bc178/src/useDeepCompareMemoize.ts
  // https://github.com/alibaba/hooks/blob/4ea74beb16b220007b91214f253b7b59b06cde6b/packages/hooks/src/createDeepCompareEffect/index.ts
  deps => {
    const deps1 = useCreation(() => castArray(deps), [deps])
    const depsRef = useRef(() => deps1)
    const signalRef = useRef(true)

    if (isUndefined(deps) || deps1.every(isPrimitive)) return deps

    if (!isEqual(deps1, depsRef.current)) {
      depsRef.current = deps1
      signalRef.current = !signalRef.current
    }

    return [signalRef.current]
  }

export const withDeepCompareDeps = hook => (fn, deps) =>
  hook(fn, useDeepCompareMemoize(deps))
