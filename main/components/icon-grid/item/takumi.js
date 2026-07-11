import {LRUCache} from 'lru-cache'
import mime from 'mime/lite' // ?
import {render} from 'takumi-js'

import {ICON_CACHE} from '../../../misc/constants'

const cache = new LRUCache({
  max: ICON_CACHE.max
})

export default Object.assign(
  async (element, {id, options}) => {
    if (cache.has(id)) return cache.get(id)

    const image = await render(element, {
      devicePixelRatio: 1,
      lossless: true,
      ...options
    })

    cache.set(id, image)

    return image
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
