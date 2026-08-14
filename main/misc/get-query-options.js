import {decode} from '@msgpack/msgpack'
import {queryOptions} from '@tanstack/react-query'
import {isEqual} from '@ver0/deep-equal'
import {safeDestr} from 'destr'
import {delay, noop} from 'es-toolkit'
import {castArray} from 'es-toolkit/compat'
import {ofetch} from 'ofetch'

import {DATABASE_URL, DELAY_MS} from './constants'
import {getId} from './get-id'

const defaults = {
  gcTime: 60_000,
  structuralSharing: (a, b) => (isEqual(a, b) ? a : b),
  timeout: 60_000
}

const fetchOptions = {
  retry: false
}

const fetch = ofetch.create(fetchOptions)

export const getQueryOptions = Object.assign(
  // https://tanstack.com/query/latest/docs/framework/react/guides/render-optimizations
  // https://tkdodo.eu/blog/react-query-selectors-supercharged
  // https://www.npmjs.com/package/memoize-one
  ({
    delayMs = DELAY_MS,
    parseResponse = safeDestr,
    queryFn,
    queryKey,
    timeout = defaults.timeout,
    url,
    ...options
  }) => {
    url = new URL(url)

    return queryOptions({
      gcTime: defaults.gcTime,
      networkMode: 'offlineFirst',
      queryFn:
        queryFn ??
        (async () => {
          await delay(delayMs)

          const fetchOptions = {
            timeout
          }

          return url.pathname.endsWith('.msgpack')
            ? decode(
                await fetch(url, {
                  responseType: 'arrayBuffer',
                  ...fetchOptions
                })
              )
            : await fetch(url, {
                parseResponse,
                ...fetchOptions
              })
        }),
      queryKey: castArray(queryKey ?? url.href),
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      retry: fetchOptions.retry,
      select: noop,
      staleTime: Infinity,
      structuralSharing: defaults.structuralSharing,
      ...options
    })
  },
  {
    icon: (iconSetPrefix, icon, options) =>
      getQueryOptions({
        queryKey: getId(iconSetPrefix, icon),
        url: `${DATABASE_URL}/${iconSetPrefix}/${icon}.msgpack`,
        ...options
      })
  }
)
