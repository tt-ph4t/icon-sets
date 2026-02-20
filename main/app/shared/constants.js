import { LRUCache } from 'lru-cache'

export const DATA_BASE_URL =
  'https://raw.githubusercontent.com/tt-ph4t/icon-sets/refs/heads/data/data'

export const DELAY_MS = 200

export const ICON_SETS_URL = `${DATA_BASE_URL}/index.toon`

export const ID_SEPARATOR = ':'

export const ICON_CACHE = new LRUCache({ max: 1000 })
