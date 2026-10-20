import {useOnceEffect as _useOnceEffect} from '@reactuses/core'

import {useDeepCompareMemoize} from './use-deep-compare-memoize'

export const useOnceEffect = useDeepCompareMemoize.with(_useOnceEffect)
