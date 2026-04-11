import {LRUCache} from 'lru-cache'
import mime from 'mime/lite' // ?
import {ImageResponse} from 'takumi-js/response'

import {
  EMPTY_BLOB,
  ICON_CACHE,
  MAX_CACHEABLE_SIZE
} from '../../../misc/constants'

const cache = new LRUCache({max: ICON_CACHE.max})

export default Object.assign(
  async (component, {id, options}) => {
    if (cache.has(id)) return cache.get(id)

    try {
      const imageResponse = new ImageResponse(component, {
        devicePixelRatio: 1,
        quality: 100,
        ...options
      })

      if (imageResponse.ok) {
        const blob = await imageResponse.blob()

        if (blob.size <= MAX_CACHEABLE_SIZE) cache.set(id, blob)

        return blob
      }

      return EMPTY_BLOB
    } catch {
      return EMPTY_BLOB
    }
  },
  {
    formats: [
      'png',
      'jpeg',
      'webp',
      'raw',
      'ico' // ?
    ].reduce((a, b) => {
      a[b] = mime.getType(b)

      return a
    }, {})
  }
)
