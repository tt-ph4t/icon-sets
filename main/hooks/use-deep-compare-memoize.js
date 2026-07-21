import {isUndefined} from '@sindresorhus/is'
import {isEqual} from '@ver0/deep-equal'
import {noop} from 'es-toolkit'

import {useRef} from './use-ref'

export const useDeepCompareMemoize = Object.assign(
  // https://github.com/sandiiarov/use-deep-compare/blob/07a9b586394d883f354648f8487b256f7c6bc178/src/useDeepCompareMemoize.ts
  // https://github.com/alibaba/hooks/blob/4ea74beb16b220007b91214f253b7b59b06cde6b/packages/hooks/src/createDeepCompareEffect/index.ts
  // https://github.com/react-hookz/web/blob/6066c932461c2cd5a88a5f0be658a4d2585d77fc/src/useCustomCompareEffect/index.ts#L36
  deps => {
    const ref = useRef(noop)
    const signalRef = useRef(() => 0)

    if (isUndefined(ref.current) || !isEqual(deps, ref.current)) {
      ref.current = deps
      signalRef.current++
    }

    return [signalRef.current]
  },
  {
    with:
      hook =>
      (fn, deps, ...args) =>
        hook(fn, useDeepCompareMemoize(deps), ...args)
  }
)
