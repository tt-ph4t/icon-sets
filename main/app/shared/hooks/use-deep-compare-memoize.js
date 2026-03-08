import { isUndefined } from '@sindresorhus/is'

import { isEqual } from '../utils'
import { useRef } from './use-ref'

export const useDeepCompareMemoize = Object.assign(
  // https://github.com/sandiiarov/use-deep-compare/blob/07a9b586394d883f354648f8487b256f7c6bc178/src/useDeepCompareMemoize.ts
  // https://github.com/alibaba/hooks/blob/4ea74beb16b220007b91214f253b7b59b06cde6b/packages/hooks/src/createDeepCompareEffect/index.ts
  deps => {
    const ref = useRef()
    const signalRef = useRef(0)

    if (isUndefined(deps) || !isEqual(deps, ref.current)) signalRef.current++

    ref.current = deps

    return [signalRef.current]
  },
  { with: hook => (fn, deps) => hook(fn, useDeepCompareMemoize(deps)) }
)
