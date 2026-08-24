import {queryOptions} from '@tanstack/react-query'
import {isEqual} from '@ver0/deep-equal'
import {noop, toMerged} from 'es-toolkit'
import {castArray} from 'es-toolkit/compat'
import {endpointSymbol} from 'vite-plugin-comlink/symbol'

import {DATABASE_URL} from './constants'
import {fetch} from './fetch'
import {getId} from './get-id'

const structuralSharing = (a, b) => (isEqual(a, b) ? a : b)

export const getQueryOptions = Object.assign(
  // https://tanstack.com/query/latest/docs/framework/react/guides/render-optimizations
  // https://tkdodo.eu/blog/react-query-selectors-supercharged
  // https://www.npmjs.com/package/memoize-one
  ({delay, queryKey, timeout, url, ...options}) => {
    url = new URL(url)

    return queryOptions(
      toMerged(
        // eslint-disable-next-line @tanstack/query/exhaustive-deps
        {
          gcTime: 60_000,
          networkMode: 'offlineFirst',
          queryFn: async query =>
            await fetch(url, {
              delay,
              signal: query.signal,
              timeout
            }),
          queryKey: castArray(queryKey ?? url.href),
          refetchOnReconnect: false,
          refetchOnWindowFocus: false,
          retry: false,
          select: noop,
          staleTime: Infinity,
          structuralSharing
        },
        options
      )
    )
  },
  {
    icon: (iconSetPrefix, icon, options) =>
      getQueryOptions({
        queryKey: getId(iconSetPrefix, icon),
        url: `${DATABASE_URL}/${iconSetPrefix}/${icon}.msgpack`,
        ...options
      }),
    worker: (worker, options) => {
      const terminate = () => {
        worker[endpointSymbol].terminate()
      }

      return {
        ...getQueryOptions(options),
        queryFn: async query => {
          if (query.signal.aborted) terminate() // ?

          query.signal.addEventListener('abort', terminate, {
            once: true
          })

          try {
            return await worker.default(options.url)
          } finally {
            terminate()
            query.signal.removeEventListener('abort', terminate)
          }
        }
      }
    }
  }
)
