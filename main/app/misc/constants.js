import {defaultIconCustomisations} from '@iconify/utils'
import {QueryClient} from '@tanstack/react-query'
import bytes from 'bytes'
import deepFreeze from 'deep-freeze-es6'
import {omit} from 'es-toolkit'
import {LRUCache} from 'lru-cache'
import ms from 'ms'

import {prettyBytes} from './pretty-bytes'

export const GITHUB_REPO = 'tt-ph4t/icon-sets'

export const DATA_BASE_URL = `https://raw.githubusercontent.com/${GITHUB_REPO}/refs/heads/data/data`

export const DELAY_MS = ms('.15s')

export const ICON_SETS_URL = `${DATA_BASE_URL}/index.toon`

export const ID_SEPARATOR = ':'

export const ICON_CACHE = new LRUCache({max: 1000})

export const QUERY_CLIENT = new QueryClient()

export const EMPTY_BLOB = new Blob()

export const MAX_CACHEABLE_SIZE = bytes.parse('256kb')

export const EMPTY_OBJECT = deepFreeze({})

export const EMPTY_ARRAY = deepFreeze([])

export const EMPTY_SIZE_TEXT = prettyBytes(0)

export const SORT_ORDER_LABELS = deepFreeze({
  asc: 'Ascending',
  desc: 'Descending'
})

export const DEFAULT_THEME = 'light'

export const CARD_STYLE =
  // https://github.com/vscode-elements/elements/blob/e71099a40fdbcbeaa50fd2d61ba2734f4e42f8d1/src/vscode-context-menu/vscode-context-menu.styles.ts
  deepFreeze({
    outline: 'unset',

    // eslint-disable-next-line unicorn/no-useless-spread
    ...{
      backgroundColor: 'var(--vscode-menu-background, #1f1f1f)',
      borderColor: 'var(--vscode-menu-border, #454545)',
      borderRadius: '5px',
      borderStyle: 'solid',
      borderWidth: '1px',
      boxShadow: '0 2px 8px var(--vscode-widget-shadow, rgba(0, 0, 0, 0.36))',
      color: 'var(--vscode-menu-foreground, #cccccc)',
      fontFamily: 'var(--vscode-font-family, sans-serif)',
      fontSize: 'var(--vscode-font-size, 13px)',
      fontWeight: 'var(--vscode-font-weight, normal)',
      lineHeight: '1.4em',
      padding: '4px 0',
      whiteSpace: 'nowrap'
    }
  })

export const DEFAULT_ICON_CUSTOMISATIONS = deepFreeze(
  omit(
    {
      ...defaultIconCustomisations,
      scale: 1
    },
    ['height', 'width']
  )
)

export const BREAKPOINTS = Object.freeze({
  '2XL': 1536,
  LG: 1024,
  MD: 768,
  SM: 640,
  XL: 1280
})

export const POWER_GLITCH_OPTIONS =
  // https://github.com/7PH/powerglitch/blob/d82fc318057a0644a55a06aa9a20c2f23ddffcb2/docs-src/src/views/HomeView.vue#L19
  deepFreeze({
    HEAVY: {
      glitchTimeSpan: {
        end: 0.8,
        start: 0.2
      }
    },
    LIGHT: {
      glitchTimeSpan: {
        end: 0.6,
        start: 0.2
      },
      shake: false,
      slice: {
        count: 3,
        velocity: 4
      }
    },
    MEDIUM: EMPTY_OBJECT,
    NONE: {
      shake: false,
      slice: {
        count: 0
      }
    }
  })
