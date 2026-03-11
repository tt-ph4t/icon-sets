import { useCreation } from 'ahooks'

import { useDeepCompareMemoize } from './use-deep-compare-memoize'
import { useRef } from './use-ref'

const useCreation1 = useDeepCompareMemoize.with(useCreation)

export const useMemo = Object.assign(
  (fn, deps = useMemo.deps.default) => {
    const isDefaultDeps = deps === useMemo.deps.default

    const value = (
      isDefaultDeps
        ? // https://garden.bradwoods.io/notes/javascript/react/memo-use-memo-use-callback
          // If you need a reference to an object or array that doesn't require recalculation,
          // useRef could be a better choice
          useRef
        : useCreation1
    )(fn, deps === useMemo.deps.noDeps ? undefined : deps)

    return isDefaultDeps ? value.current : value
  },
  {
    deps: {
      default: Symbol(),
      noDeps: Symbol()
    }
  }
)
