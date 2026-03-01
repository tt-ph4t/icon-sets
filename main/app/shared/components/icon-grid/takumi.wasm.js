import ImageResponse from '@takumi-rs/image-response/wasm'
import module from '@takumi-rs/wasm/takumi_wasm_bg.wasm?url'
import { LRUCache } from 'lru-cache'
import mime from 'mime/lite'

import { ICON_CACHE } from '../../constants'

const cache = new LRUCache({ max: ICON_CACHE.max })

export default Object.assign(
  async ({ component, id, options }) => {
    if (cache.has(id)) return cache.get(id)

    const imageResponse = new ImageResponse(component, {
      module,
      quality: 100,
      ...options
    })

    const blob = imageResponse.ok ? await imageResponse.blob() : new Blob()

    cache.set(id, blob)

    return blob
  },
  {
    formats: ['png', 'jpeg', 'webp', 'raw'].reduce((a, b) => {
      a[b] = mime.getType(b)

      return a
    }, {})
  }
)
