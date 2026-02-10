import React from 'react'

import { withDeepCompareDeps } from './use-deep-compare-memoize'

export const useEffect = withDeepCompareDeps(React.useEffect)
