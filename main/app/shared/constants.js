import { LRUCache } from 'lru-cache'

export const GITHUB_REPO = 'tt-ph4t/icon-sets'

export const DATA_BASE_URL = `https://raw.githubusercontent.com/${GITHUB_REPO}/refs/heads/data/data`

export const DELAY_MS = 200

export const ICON_SETS_URL = `${DATA_BASE_URL}/index.toon`

export const ID_SEPARATOR = ':'

export const ICON_CACHE = new LRUCache({ max: 1000 })

export const CARD_STYLE =
  // https://github.com/vscode-elements/elements/blob/e71099a40fdbcbeaa50fd2d61ba2734f4e42f8d1/src/vscode-context-menu/vscode-context-menu.styles.ts
  {
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
  }
