import {useThrottledCallback} from '@tanstack/react-pacer'
import {union, uniq, without} from 'es-toolkit'
import {castArray} from 'es-toolkit/compat'

import {validateIconId} from '../misc'
import {EMPTY} from '../misc/constants'
import {useCallback} from './use-callback'
import {useState} from './use-state'

const defaultValue = EMPTY.ARRAY

export const useFavoritedIcons = Object.assign(
  (key = 'useFavoritedIcons') => {
    const [state, setState] = useState.localStorage(key, {
      defaultValue
    })

    const throttledSetState = useThrottledCallback(fn => {
      setState((...args) => fn(...args).filter(validateIconId))
    })

    const set = new Set(castArray(state).filter(validateIconId))

    return {
      add: useCallback((...iconIds) => {
        throttledSetState(state => union(iconIds, state))
      }),
      delete: useCallback((...iconIds) => {
        throttledSetState(state => without(state, ...iconIds))
      }),
      get: useCallback(() => [...set]),
      has: useCallback((...iconIds) =>
        iconIds.every(iconId => set.has(iconId))
      ),
      reset: useCallback(() => {
        throttledSetState(() => defaultValue)
      }),
      toggle: useCallback((...iconIds) => {
        throttledSetState(state => {
          const a = new Set()
          const b = new Set(castArray(state))

          for (const iconId of uniq(iconIds))
            b.has(iconId) ? b.delete(iconId) : a.add(iconId)

          return [...a, ...b]
        })
      })
    }
  },
  {
    actions: ['toggle', 'add', 'delete']
  }
)
