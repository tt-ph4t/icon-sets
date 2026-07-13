import mime from 'mime/lite' // ?
import {render} from 'takumi-js'

import {cache} from '../../../misc/cache'

export default Object.assign(
  cache(
    async (element, options) =>
      await render(element, {
        devicePixelRatio: 1,
        lossless: true,
        quality: 100,
        ...options
      })
  ),
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
