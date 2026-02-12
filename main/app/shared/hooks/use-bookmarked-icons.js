import { useLocalStorageState } from 'ahooks'
import { union, uniq, without } from 'es-toolkit'
import { castArray } from 'es-toolkit/compat'

import { validateIconId } from '../utils'
import { useCallback } from './use-callback'
import { useMemo } from './use-memo'

export const useBookmarkedIcons = () => {
  const [state, setState] = useLocalStorageState('useBookmarkedIcons', {
    defaultValue: [],
    listenStorageChange: true
  })

  const current = useMemo(
    () => castArray(state).filter(validateIconId),
    [state]
  )

  const set = useCallback(fn => {
    setState(state => fn(state).filter(validateIconId))
  })

  return {
    add: useCallback((...iconIds) => {
      set(state => union(iconIds, state))
    }),
    current,
    delete: useCallback((...iconIds) => {
      set(state => without(state, ...iconIds))
    }),
    has: useCallback((...iconIds) =>
      iconIds.every(iconId => current.includes(iconId))
    ),
    reset: useCallback(() => {
      set(() => [])
    }),
    set,
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
