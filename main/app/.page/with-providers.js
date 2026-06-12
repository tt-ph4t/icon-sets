import {DirectionProvider} from '@base-ui/react/direction-provider'
import {HotkeysProvider} from '@tanstack/react-hotkeys'
import {PacerProvider} from '@tanstack/react-pacer'
import {QueryClientProvider} from '@tanstack/react-query'
import {mapValues} from 'es-toolkit'
import {NuqsAdapter} from 'nuqs/adapters/react'

import {component} from '../hocs'
import {DELAY_MS, EMPTY_OBJECT, QUERY_CLIENT} from '../misc/constants'

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
    options => ({
      wait: DELAY_MS,
      ...options
    })
  )
}

export default Component =>
  component(() => (
    <DirectionProvider>
      <NuqsAdapter>
        <QueryClientProvider client={QUERY_CLIENT.GLOBAL}>
          <PacerProvider {...PacerProviderProps}>
            <HotkeysProvider>
              <Component />
            </HotkeysProvider>
          </PacerProvider>
        </QueryClientProvider>
      </NuqsAdapter>
    </DirectionProvider>
  ))
