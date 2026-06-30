import {stringToIcon} from '@iconify/utils'
import {LRUCache} from 'lru-cache'

import {isWordCharacter, trigger} from './'
import {ICON_CACHE} from './constants'

const cache = new LRUCache({
  max: ICON_CACHE.max * 2
})

export const parseIconName = (iconId, validate = true) => {
  if (isWordCharacter(iconId)) {
    if (cache.has(iconId)) return cache.get(iconId)

    let icon = stringToIcon(iconId, validate) ?? trigger.error()

    cache.set(
      iconId,
      (icon = {
        icon
      })
    )

    return icon
  }

  trigger.error()
}
