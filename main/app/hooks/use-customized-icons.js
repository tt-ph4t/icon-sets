import {mergeCustomisations} from '@iconify/utils'
import {useThrottledCallback} from '@tanstack/react-pacer'
import {isEqual} from '@ver0/deep-equal'
import {noop, pick} from 'es-toolkit'
import {castArray} from 'es-toolkit/compat'

import {DEFAULT_ICON_CUSTOMISATIONS, EMPTY, ICON_CACHE} from '../misc/constants'
import {withImmerAtom} from '../misc/with-immer-atom'

mergeCustomisations // ?

const useStore = withImmerAtom({
  current: EMPTY.OBJECT,
  global: pick(DEFAULT_ICON_CUSTOMISATIONS, ['color', 'square'])
})

const withInvalidatedIconCache = (fn = noop, iconIds) => {
  fn()

  for (const iconId of castArray(iconIds)) ICON_CACHE.delete(iconId)
}

export const useCustomizedIcons = Object.assign(
  () => {
    const store = useStore()

    return {
      delete: useThrottledCallback((...iconIds) => {
        withInvalidatedIconCache(() => {
          store.set(({draft}) => {
            for (const iconId of iconIds) delete draft.current[iconId]
          })
        }, iconIds)
      }),
      reset: useThrottledCallback(() => {
        store.reset('current')
      }),
      set: useThrottledCallback((iconId, fn) => {
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
