import { defaultIconCustomisations, mergeCustomisations } from '@iconify/utils'
import { omit } from 'es-toolkit'

import { ICON_CACHE } from '../constants'
import { withImmerAtom } from '../hocs'
import { isEqual } from '../utils'
import { useCallback } from './use-callback'

const useStore = withImmerAtom({ current: {} })
const result = iconCustomisations => ({ iconCustomisations })

const invalidateIconCache = (fn, ...iconIds) => {
  for (const iconId of iconIds) ICON_CACHE.delete(iconId)

  fn()
}

export const useCustomizedIcons = Object.assign(
  () => {
    const store = useStore()

    return {
      delete: useCallback((...iconIds) => {
        invalidateIconCache(
          () => {
            store.set(({ draft }) => {
              draft.current = omit(draft.current, iconIds)
            })
          },
          ...iconIds
        )
      }),
      set: useCallback((iconId, fn) => {
        invalidateIconCache(() => {
          store.set(({ draft }) => {
            const a = draft.current[iconId] ?? defaultIconCustomisations
            const b = fn(result(a))

            mergeCustomisations
            if (!isEqual(a, b)) draft.current[iconId] = { ...a, ...b }
          })
        }, iconId)
      })
    }
  },
  {
    useIconIds: () =>
      useStore().useSelectValue(({ draft }) => Object.keys(draft.current)),
    useSelectValue: iconId =>
      useStore().useSelectValue(
        ({ draft }) =>
          result(draft.current[iconId] ?? defaultIconCustomisations),
        { deps: [iconId] }
      )
  }
)
