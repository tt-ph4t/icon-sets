import {queryOptions} from '@tanstack/react-query'
import {decode} from '@toon-format/toon'
import {isEqual} from '@ver0/deep-equal'
import axios from 'axios'
import {identity, noop} from 'es-toolkit'
import {castArray} from 'es-toolkit/compat'
import ms from 'ms'

const defaults = {
  gcTime: ms('50m'),
  structuralSharing: (a, b) => (isEqual(a, b) ? a : b)
}

export const getQueryOptions =
  // https://tanstack.com/query/latest/docs/framework/react/guides/render-optimizations
  ({
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
    toonFormat = true,
    url,
    ...rest
  }) =>
    queryOptions({
      gcTime,
      networkMode,
      queryFn:
        queryFn ??
        (async () =>
          (toonFormat ? decode : identity)((await axios.get(url)).data)),
      queryKey: castArray(queryKey ?? url),
      refetchOnReconnect,
      refetchOnWindowFocus,
      retry,
      select,
      staleTime,
      structuralSharing,
      ...rest
    })
