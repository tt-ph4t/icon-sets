import {useThrottler} from '@tanstack/react-pacer/throttler'
import {union, uniq, without} from 'es-toolkit'
import {castArray} from 'es-toolkit/compat'
import ms from 'ms'

import {validateIconId} from '../misc'
import {EMPTY_ARRAY} from '../misc/constants'
import {useCallback} from './use-callback'
import {useState} from './use-state'

const defaults = {
  key: 'useFavoritedIcons',
  throttlerOptions: {wait: ms('1s')},
  value: EMPTY_ARRAY
}

export const useFavoritedIcons = (
  key = defaults.key,
  throttlerOptions = defaults.throttlerOptions
) => {
  const [state, setState] = useState.LocalStorage(key, {
    defaultValue: defaults.value
  })

  const throttler = useThrottler(setState, throttlerOptions)

  const set = useCallback(fn => {
    throttler.maybeExecute(state => fn(state).filter(validateIconId))
  })

  const current = castArray(state).filter(validateIconId)

  return {
    add: useCallback((...iconIds) => {
      set(state => union(iconIds, state))
    }),
    current,
    delete: useCallback((...iconIds) => {
      set(state => without(state, ...iconIds))
    }),
    has: useCallback((...iconIds) => {
      return iconIds.every(iconId => current.includes(iconId))
    }),
    reset: useCallback(() => {
      set(() => defaults.value)
    }),
    set,
    throttler,
    toggle: useCallback((...iconIds) => {
      set(state => {
        const a = new Set()
        const b = new Set(castArray(state))

        for (const iconId of uniq(iconIds))
          b.has(iconId) ? b.delete(iconId) : a.add(iconId)

        return [...a, ...b]
      })
    })
  }
}
