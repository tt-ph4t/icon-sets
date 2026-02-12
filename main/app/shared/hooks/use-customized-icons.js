import { defaultIconCustomisations } from '@iconify/utils'
import { omit } from 'es-toolkit'

import { withImmerAtom } from '../hocs'
import { isEqual } from '../utils'
import { useCallback } from './use-callback'
import { iconCache } from './use-icon-queries/build-icon'

const useCustomizedIcons1 = withImmerAtom({ current: {} })
const result = iconCustomisations => ({ iconCustomisations })

const invalidateIconCache = (fn, ...iconIds) => {
  for (const iconId of iconIds) iconCache.delete(iconId)

  fn()
}

export const useCustomizedIcons = Object.assign(
  () => {
    const customizedIcons = useCustomizedIcons1()

    return {
      delete: useCallback((...iconIds) => {
        invalidateIconCache(
          () => {
            customizedIcons.set(({ draft }) => {
              draft.current = omit(draft.current, iconIds)
            })
          },
          ...iconIds
        )
      }),
      set: useCallback((iconId, fn) => {
        invalidateIconCache(() => {
          customizedIcons.set(({ draft }) => {
            const a = draft.current[iconId] ?? defaultIconCustomisations
            const b = fn(result(a))

            if (!isEqual(a, b)) draft.current[iconId] = { ...a, ...b }
          })
        }, iconId)
      })
    }
  },
  {
    useIconIds: () =>
      useCustomizedIcons1().useSelectValue(({ draft }) =>
        Object.keys(draft.current)
      ),
    useSelectValue: iconId =>
      useCustomizedIcons1().useSelectValue(
        ({ draft }) =>
          result(draft.current[iconId] ?? defaultIconCustomisations),
        [iconId]
      )
  }
)
