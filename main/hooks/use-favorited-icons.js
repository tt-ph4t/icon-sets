import {useBatchedCallback} from '@tanstack/react-pacer'
import {last, union, uniq, without} from 'es-toolkit'
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

    const batchedSetState = useBatchedCallback(items => {
      setState((...args) => last(items)(...args).filter(validateIconId))
    })

    const set = new Set(castArray(state).filter(validateIconId))

    return {
      add: useCallback((...iconIds) => {
        batchedSetState(state => union(iconIds, state))
      }),
      delete: useCallback((...iconIds) => {
        batchedSetState(state => without(state, ...iconIds))
      }),
      get: useCallback(() => [...set]),
      has: useCallback((...iconIds) =>
        iconIds.every(iconId => set.has(iconId))
      ),
      reset: useCallback(() => {
        batchedSetState(() => defaultValue)
      }),
      toggle: useCallback((...iconIds) => {
        batchedSetState(state => {
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
