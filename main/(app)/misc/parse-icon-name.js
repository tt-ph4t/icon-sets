import {stringToIcon} from '@iconify/utils'
import {isWordCharacter} from 'is-word-character'
import {LRUCache} from 'lru-cache'

import {trigger} from './'
import {ICON_CACHE} from './constants'

const cache = new LRUCache({max: ICON_CACHE.max * 2})

export const parseIconName = (value, validate = true) => {
  if (cache.has(value)) return cache.get(value)

  if (isWordCharacter(value)) {
    const icon = stringToIcon(value, validate) ?? trigger.error()

    cache.set(value, icon)

    return icon
  }

  trigger.error()
}
