import {DirectionProvider} from '@base-ui/react'
import {HotkeysProvider} from '@tanstack/react-hotkeys'
import {PacerProvider} from '@tanstack/react-pacer'
import {QueryClientProvider} from '@tanstack/react-query'
import {mapValues} from 'es-toolkit'
import {Direction} from 'radix-ui'

import {component} from '../hocs'
import {DELAY_MS, EMPTY, QUERY_CLIENT} from '../misc/constants'

const PacerProviderProps = {
  defaultOptions: mapValues(
    {
      asyncBatcher: EMPTY.OBJECT,
      asyncDebouncer: EMPTY.OBJECT,
      asyncQueuer: EMPTY.OBJECT,
      asyncRateLimiter: EMPTY.OBJECT,
      asyncThrottler: EMPTY.OBJECT,
      batcher: EMPTY.OBJECT,
      debouncer: EMPTY.OBJECT,
      queuer: EMPTY.OBJECT,
      rateLimiter: EMPTY.OBJECT,
      throttler: EMPTY.OBJECT
    },
    options => ({
      wait: DELAY_MS,
      ...options
    })
  )
}

export default Component =>
  component(props => (
    <Direction.Provider>
      <DirectionProvider>
        <PacerProvider {...PacerProviderProps}>
          <QueryClientProvider client={QUERY_CLIENT.GLOBAL}>
            <HotkeysProvider>
              <Component {...props} />
            </HotkeysProvider>
          </QueryClientProvider>
        </PacerProvider>
      </DirectionProvider>
    </Direction.Provider>
  ))
