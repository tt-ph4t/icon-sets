import { union, uniq, without } from 'es-toolkit'
import { castArray } from 'es-toolkit/compat'

import { validateIconId } from '../utils'
import { useCallback } from './use-callback'
import { useLocalStorageState } from './use-local-storage-state'

const defaultValue = []

export const useFavorites = () => {
  const [state, setState] = useLocalStorageState('useFavorites', {
    defaultValue
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
      setState(defaultValue)
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
