import {decode} from '@msgpack/msgpack'
import {safeDestr} from 'destr'
import {delay, toMerged} from 'es-toolkit'
import {ofetch} from 'ofetch'

import {DELAY_MS, EMPTY} from './constants'

export const fetch = async (
  url,
  {delay: delayMs = DELAY_MS, ...options} = EMPTY.OBJECT
) => {
  await delay(delayMs)

  url = new URL(url)

  options = toMerged(
    {
      retry: false,
      timeout: 60_000
    },
    options
  )

  return url.pathname.endsWith('.msgpack')
    ? decode(
        await ofetch(url, {
          responseType: 'arrayBuffer',
          ...options
        })
      )
    : await ofetch(url, {
        parseResponse: safeDestr,
        ...options
      })
}
