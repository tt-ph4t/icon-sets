import {PacerProvider} from '@tanstack/react-pacer'
import {QueryClientProvider} from '@tanstack/react-query'
import {mapValues} from 'es-toolkit'

import {component} from './(app)/hocs'
import {DELAY_MS, EMPTY_OBJECT, QUERY_CLIENT} from './(app)/misc/constants'

const PacerProviderProps = {
  defaultOptions: mapValues(
    {
      asyncBatcher: EMPTY_OBJECT,
      asyncDebouncer: EMPTY_OBJECT,
      asyncQueuer: EMPTY_OBJECT,
      asyncRateLimiter: EMPTY_OBJECT,
      asyncThrottler: EMPTY_OBJECT,
      batcher: EMPTY_OBJECT,
      debouncer: EMPTY_OBJECT,
      queuer: EMPTY_OBJECT,
      rateLimiter: EMPTY_OBJECT,
      throttler: EMPTY_OBJECT
    },
    options => ({wait: DELAY_MS, ...options})
  )
}

export default component(({children}) => (
  <PacerProvider {...PacerProviderProps}>
    <QueryClientProvider client={QUERY_CLIENT}>{children}</QueryClientProvider>
  </PacerProvider>
))
