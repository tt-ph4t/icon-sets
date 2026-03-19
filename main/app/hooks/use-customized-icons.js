import { mergeCustomisations } from '@iconify/utils'
import { isEqual } from '@ver0/deep-equal'

import { DEFAULT_ICON_CUSTOMISATIONS, ICON_CACHE } from '../constants'
import { withImmerAtom } from '../hocs/with-immer-atom'
import { useCallback } from './use-callback'

mergeCustomisations

const useStore = withImmerAtom()
const result = iconCustomisations => ({ iconCustomisations })

const invalidateIconCache = (fn, ...iconIds) => {
  fn()

  for (const iconId of iconIds) ICON_CACHE.delete(iconId)
}

export const useCustomizedIcons = Object.assign(
  () => {
    const store = useStore()

    return {
      delete: useCallback((...iconIds) => {
        invalidateIconCache(
          () => {
            store.set(({ draft }) => {
              for (const iconId of iconIds) delete draft[iconId]
            })
          },
          ...iconIds
        )
      }),
      set: useCallback((iconId, fn) => {
        invalidateIconCache(() => {
          store.set(({ draft }) => {
            const a = draft[iconId] ?? DEFAULT_ICON_CUSTOMISATIONS
            const b = fn(result(a))
            const c = { ...a, ...b }

            if (isEqual(c, DEFAULT_ICON_CUSTOMISATIONS)) delete draft[iconId]
            else draft[iconId] = c
          })
        }, iconId)
      })
    }
  },
  {
    useIconIds: () =>
      useStore().useSelectValue(({ draft }) => Object.keys(draft)),
    useSelect: iconId =>
      useStore().useSelectValue(
        ({ draft }) => result(draft[iconId] ?? DEFAULT_ICON_CUSTOMISATIONS),
        { deps: [iconId] }
      )
  }
)
