import mime from 'mime'
import {render} from 'takumi-js'

import {cache} from './cache'
import {withImmerAtom} from './with-immer-atom'

const defaultDithering = 'none'

export const takumi = Object.assign(
  cache(
    async (element, options) =>
      await render(element, {
        lossless: true,
        quality: 100,
        ...options
      })
  ),
  {
    ditheringValues: [defaultDithering, 'ordered-bayer', 'floyd-steinberg'],
    formats: ['png', 'jpeg', 'webp', 'raw', 'ico'].reduce((a, b) => {
      a[b] = mime.getType(b)

      return a
    }, {}),
    label: 'Takumi',
    useStore: withImmerAtom({
      devicePixelRatio: 1,
      dithering: defaultDithering,
      drawDebugBorder: false
    })
  }
)
