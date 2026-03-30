import {mergeCustomisations} from '@iconify/utils'
import {useThrottler} from '@tanstack/react-pacer/throttler'
import {isEqual} from '@ver0/deep-equal'

import {withImmerAtom} from '../hocs/with-immer-atom'
import {DEFAULT_ICON_CUSTOMISATIONS, ICON_CACHE} from '../misc/constants'
import {useCallback} from './use-callback'

mergeCustomisations

const useStore = withImmerAtom()
const result = iconCustomisations => ({iconCustomisations})

const invalidateIconCache = (fn, ...iconIds) => {
  fn()

  for (const iconId of iconIds) ICON_CACHE.delete(iconId)
}

export const useCustomizedIcons = Object.assign(
  () => {
    const throttler = useThrottler(useStore().set)

    return {
      delete: useCallback((...iconIds) => {
        throttler.maybeExecute(({draft}) => {
          invalidateIconCache(
            () => {
              for (const iconId of iconIds) delete draft[iconId]
            },
            ...iconIds
          )
        })
      }),
      set: useCallback((iconId, fn) => {
        throttler.maybeExecute(({draft}) => {
          invalidateIconCache(() => {
            const a = draft[iconId] ?? DEFAULT_ICON_CUSTOMISATIONS
            const b = fn(result(a))
            const c = {...a, ...b}

            if (isEqual(c, DEFAULT_ICON_CUSTOMISATIONS)) delete draft[iconId]
            else draft[iconId] = c
          }, iconId)
        })
      }),
      throttler
    }
  },
  {
    useIconIds: () =>
      useStore().useSelectValue(({draft}) => Object.keys(draft)),
    useSelect: iconId =>
      useStore().useSelectValue(
        ({draft}) => result(draft[iconId] ?? DEFAULT_ICON_CUSTOMISATIONS),
        {deps: [iconId]}
      )
  }
)
