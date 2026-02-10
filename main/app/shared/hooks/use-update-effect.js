import { useUpdateEffect as useUpdateEffect1 } from 'ahooks'

import { withDeepCompareDeps } from './use-deep-compare-memoize'

export const useUpdateEffect = withDeepCompareDeps(useUpdateEffect1)
