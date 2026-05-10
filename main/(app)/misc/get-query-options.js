import {decode} from '@msgpack/msgpack'
import {queryOptions} from '@tanstack/react-query'
import {isEqual} from '@ver0/deep-equal'
import axios from 'axios'
import {safeDestr} from 'destr'
import {delay, identity, mapValues, noop} from 'es-toolkit'
import {castArray} from 'es-toolkit/compat'
import ms from 'ms'

import {DELAY_MS} from './constants'

const defaults = {
  gcTime: ms('50m'),
  structuralSharing: (a, b) => (isEqual(a, b) ? a : b),
  timeout: ms('1m')
}

const axiosInstances = mapValues(
  {
    msgpack: {
      responseType: 'arraybuffer',
      transformResponse: [decode, safeDestr]
    },
    safeDestr: {
      transformResponse: safeDestr
    },
    // eslint-disable-next-line perfectionist/sort-objects
    default: undefined
  },
  axios.create
)

export const getQueryOptions =
  // https://tanstack.com/query/latest/docs/framework/react/guides/render-optimizations
  // https://tkdodo.eu/blog/react-query-selectors-supercharged
  // https://www.npmjs.com/package/memoize-one
  ({
    delayMs = DELAY_MS,
    gcTime = defaults.gcTime,
    networkMode = 'offlineFirst',
    queryFn,
    queryKey,
    refetchOnReconnect = false,
    refetchOnWindowFocus = false,
    retry = 1,
    select = noop,
    staleTime = Infinity,
    structuralSharing = defaults.structuralSharing,
    timeout = defaults.timeout,
    transformData = identity,
    url,
    ...rest
  }) =>
    queryOptions({
      gcTime,
      networkMode,
      queryFn:
        queryFn ??
        (async () => {
          for (const axios of Object.values(axiosInstances))
            try {
              await delay(delayMs)

              return await transformData(
                (
                  await axios.get(url, {
                    timeout
                  })
                ).data
              )
            } catch {}
        }),
      queryKey: castArray(queryKey ?? url),
      refetchOnReconnect,
      refetchOnWindowFocus,
      retry,
      select,
      staleTime,
      structuralSharing,
      ...rest
    })
