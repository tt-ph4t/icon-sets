import {isPromise} from '@sindresorhus/is'
import {noop} from 'es-toolkit'
import {LRUCache} from 'lru-cache'
import {hash} from 'ohash'

import {EMPTY} from './constants'

const memoize =
  // https://github.com/toss/es-toolkit/blob/171d8a8a5941671d3b8e99ba617bfb27cf2c71b3/src/function/memoize.ts
  // https://github.com/toss/es-toolkit/issues/1739
  (fn = noop, {cache = new Map(), getCacheKey = noop} = EMPTY.OBJECT) => {
    function memoizedFn(...args) {
      const key = getCacheKey(...args)

      if (cache.has(key)) return cache.get(key)

      const result = Reflect.apply(fn, this, args)

      cache.set(key, result)

      if (isPromise(result) && cache.get(key) === result)
        result.catch(() => {
          cache.delete(key)
        })

      return result
    }

    memoizedFn.cache = cache

    return memoizedFn
  }

const defaultGetCacheKey = (...args) => hash(args)

export const cache = (
  fn,
  {cache, getCacheKey = defaultGetCacheKey, ...options} = EMPTY.OBJECT
) =>
  memoize(fn, {
    cache:
      cache ??
      new LRUCache({
        max: 100,
        ...options
      }),
    getCacheKey
  })
