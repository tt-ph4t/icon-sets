import {useUpdateEffect as _useUpdateEffect} from 'ahooks'

import {useDeepCompareMemoize} from './use-deep-compare-memoize'

export const useUpdateEffect = useDeepCompareMemoize.with(_useUpdateEffect)
