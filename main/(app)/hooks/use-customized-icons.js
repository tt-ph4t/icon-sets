import {mergeCustomisations} from '@iconify/utils'
import {useThrottler} from '@tanstack/react-pacer'
import {isEqual} from '@ver0/deep-equal'
import {pick} from 'es-toolkit'

import {withImmerAtom} from '../hocs/with-immer-atom'
import {
  DEFAULT_ICON_CUSTOMISATIONS,
  EMPTY_OBJECT,
  ICON_CACHE
} from '../misc/constants'
import {useCallback} from './use-callback'

mergeCustomisations

const useStore = withImmerAtom({
  current: EMPTY_OBJECT,
  globalOptions: pick(DEFAULT_ICON_CUSTOMISATIONS, ['color', 'square'])
})

const result = iconCustomisations => ({iconCustomisations})

const invalidateIconCache = (fn, ...iconIds) => {
  fn()

  for (const iconId of iconIds) ICON_CACHE.delete(iconId)
}

export const useCustomizedIcons = Object.assign(
  () => {
    const store = useStore()
    const throttler = useThrottler(store.set)

    return {
      delete: useCallback((...iconIds) => {
        throttler.maybeExecute(({draft}) => {
          invalidateIconCache(
            () => {
              for (const iconId of iconIds) delete draft.current[iconId]
            },
            ...iconIds
          )
        })
      }),
      set: useCallback((iconId, fn) => {
        throttler.maybeExecute(({draft}) => {
          invalidateIconCache(() => {
            const a = draft.current[iconId] ?? DEFAULT_ICON_CUSTOMISATIONS
            const b = fn(result(a))
            const c = {...a, ...b}

            if (isEqual(c, DEFAULT_ICON_CUSTOMISATIONS))
              delete draft.current[iconId]
            else draft.current[iconId] = c
          }, iconId)
        })
      }),
      store,
      throttler
    }
  },
  {
    useIconIds: () =>
      useStore().useSelectValue(({draft}) => Object.keys(draft.current)),
    useSelect: iconId =>
      useStore().useSelectValue(
        ({draft}) =>
          result(draft.current[iconId] ?? DEFAULT_ICON_CUSTOMISATIONS),
        {deps: [iconId]}
      )
  }
)
