import {useAsyncEffect as _useAsyncEffect} from 'ahooks'

import {useDeepCompareMemoize} from './use-deep-compare-memoize'

export const useAsyncEffect = useDeepCompareMemoize.with(_useAsyncEffect)
