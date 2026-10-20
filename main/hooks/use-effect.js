import React from 'react'

import {useDeepCompareMemoize} from './use-deep-compare-memoize'

export const useEffect = useDeepCompareMemoize.with(React.useEffect)
