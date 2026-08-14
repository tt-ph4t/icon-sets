import {mergeCustomisations} from '@iconify/utils'
import {isEqual} from '@ver0/deep-equal'
import {noop, pick} from 'es-toolkit'
import {castArray} from 'es-toolkit/compat'

import {hasValues} from '../misc'
import {DEFAULT_ICON_CUSTOMISATIONS, EMPTY, ICON_CACHE} from '../misc/constants'
import {withImmerAtom} from '../misc/with-immer-atom'
import {useCallback} from './use-callback'

mergeCustomisations

const useStore = withImmerAtom({
  current: EMPTY.OBJECT,
  global: pick(DEFAULT_ICON_CUSTOMISATIONS, ['color', 'square'])
})

const withInvalidatedIconCache = (fn = noop, iconIds) => {
  fn()

  if (hasValues(iconIds))
    for (const iconId of castArray(iconIds)) ICON_CACHE.delete(iconId)
  else ICON_CACHE.clear()
}

export const useCustomizedIcons = Object.assign(
  () => {
    const store = useStore()

    return {
      delete: useCallback((...iconIds) => {
        withInvalidatedIconCache(() => {
          store.set(({draft}) => {
            for (const iconId of iconIds) delete draft.current[iconId]
          })
        }, iconIds)
      }),
      reset: useCallback(() => {
        withInvalidatedIconCache(() => {
          store.reset('current')
        })
      }),
      set: useCallback((iconId, fn) => {
        withInvalidatedIconCache(() => {
          store.set(({draft}) => {
            const a = draft.current[iconId] ?? DEFAULT_ICON_CUSTOMISATIONS

            const b = fn({
              iconCustomisations: a
            })

            const c = {
              ...a,
              ...b
            }

            if (isEqual(c, DEFAULT_ICON_CUSTOMISATIONS))
              delete draft.current[iconId]
            else draft.current[iconId] = c
          })
        }, iconId)
      })
    }
  },
  {
    useIconIds: () =>
      useStore().useSelectValue(({draft}) => Object.keys(draft.current)),
    useSelect: iconId =>
      useStore().useSelectValue(
        ({draft}) => ({
          iconCustomisations:
            draft.current[iconId] ?? DEFAULT_ICON_CUSTOMISATIONS
        }),
        {
          deps: [iconId]
        }
      ),
    useStore
  }
)
