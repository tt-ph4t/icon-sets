import {union, uniq, without} from 'es-toolkit'
import {castArray} from 'es-toolkit/compat'

import {validateIconId} from '../misc'
import {EMPTY_ARRAY} from '../misc/constants'
import {useCallback} from './use-callback'
import {useState} from './use-state'

export const useFavorites = () => {
  const [state, setState] = useState.LocalStorage('useFavorites', {
    defaultValue: EMPTY_ARRAY
  })

  return {
    add: useCallback(function (...iconIds) {
      this.set(state => union(iconIds, state))
    }),
    current: castArray(state).filter(validateIconId),
    delete: useCallback(function (...iconIds) {
      this.set(state => without(state, ...iconIds))
    }),
    has: useCallback(function (...iconIds) {
      return iconIds.every(iconId => this.current.includes(iconId))
    }),
    reset: useCallback(() => {
      setState(EMPTY_ARRAY)
    }),
    set: useCallback(fn => {
      setState(state => fn(state).filter(validateIconId))
    }),
    toggle: useCallback(function (...iconIds) {
      this.set(state => {
        const a = new Set()
        const b = new Set(castArray(state))

        for (const iconId of uniq(iconIds))
          b.has(iconId) ? b.delete(iconId) : a.add(iconId)

        return [...a, ...b]
      })
    })
  }
}
