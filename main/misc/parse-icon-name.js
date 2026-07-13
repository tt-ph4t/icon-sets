import {stringToIcon} from '@iconify/utils'

import {cache} from './cache'
import {ICON_CACHE} from './constants'
import {trigger} from './trigger'

export const parseIconName = cache(
  iconId => ({
    icon: stringToIcon(iconId, true) ?? trigger.error()
  }),
  {
    getCacheKey: iconId => iconId,
    max: ICON_CACHE.max
  }
)
