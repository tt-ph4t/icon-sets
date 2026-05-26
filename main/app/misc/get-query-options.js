import {decode} from '@msgpack/msgpack'
import {queryOptions} from '@tanstack/react-query'
import {isEqual} from '@ver0/deep-equal'
import {safeDestr} from 'destr'
import {delay, noop} from 'es-toolkit'
import {castArray} from 'es-toolkit/compat'
import ms from 'ms'
import {ofetch} from 'ofetch'

import {DELAY_MS} from './constants'

const defaults = {
  gcTime: ms('50m'),
  structuralSharing: (a, b) => (isEqual(a, b) ? a : b),
  timeout: ms('1m')
}

const internalOfetch = ofetch.create({
  retry: false
})

export const getQueryOptions =
  // https://tanstack.com/query/latest/docs/framework/react/guides/render-optimizations
  // https://tkdodo.eu/blog/react-query-selectors-supercharged
  // https://www.npmjs.com/package/memoize-one
  ({
    delayMs = DELAY_MS,
    gcTime = defaults.gcTime,
    networkMode = 'offlineFirst',
    parseResponse = safeDestr,
    queryFn,
    queryKey,
    refetchOnReconnect = false,
    refetchOnWindowFocus = false,
    retry = false,
    select = noop,
    staleTime = Infinity,
    structuralSharing = defaults.structuralSharing,
    timeout = defaults.timeout,
    url,
    ...rest
  }) => {
    queryKey = castArray(queryKey ?? url)
    url = new URL(url)

    return queryOptions({
      gcTime,
      networkMode,
      queryFn:
        queryFn ??
        (async () => {
          await delay(delayMs)

          const ofetchOptions = {
            timeout
          }

          return url.pathname.endsWith('.msgpack')
            ? decode(
                await internalOfetch(url, {
                  responseType: 'arrayBuffer',
                  ...ofetchOptions
                })
              )
            : await internalOfetch(url, {
                parseResponse,
                ...ofetchOptions
              })
        }),
      queryKey,
      refetchOnReconnect,
      refetchOnWindowFocus,
      retry,
      select,
      staleTime,
      structuralSharing,
      ...rest
    })
  }
