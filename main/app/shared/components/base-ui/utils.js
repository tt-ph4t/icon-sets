import { isFunction } from '@sindresorhus/is'
import { noop } from 'es-toolkit'
import React from 'react'

export const resolveRender = (value, ...args) =>
  React.isValidElement(value)
    ? value
    : (isFunction(value) ? value : noop)(...args)

export const cardStyle =
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
