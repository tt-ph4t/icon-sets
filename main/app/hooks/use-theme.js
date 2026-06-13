import {useEventListener} from 'ahooks'
import Cycled from 'cycled'
import {asyncNoop} from 'es-toolkit'
import React from 'react'

import {useState} from './use-state'

const selectorElement = document
  .querySelector('vscode-dev-toolbar')
  .shadowRoot.querySelector('vscode-theme-selector')
  .shadowRoot.querySelector('#theme-selector')

const ids = Iterator.from(selectorElement.options)
  .map(option => ({
    label: option.textContent,
    value: option.value
  }))
  .toArray()

const changeEvent = new Event('change')

const set = id => {
  selectorElement.value = id

  selectorElement.dispatchEvent(changeEvent)
}

const cycled = new Cycled(ids)

cycled.index = ids.findIndex(id => id.value === selectorElement.value)

export const useTheme = (onChange = asyncNoop) => {
  const [state, setState] = useState(selectorElement.value)

  useEventListener(
    'change',
    async (...args) => {
      const themeId = args[0].target.value

      cycled.index = ids.findIndex(id => id.value === themeId)

      await onChange(...args)

      React.startTransition(() => {
        setState(themeId)
      })
    },
    {
      target: selectorElement
    }
  )

  return {
    cycled,
    id: state,
    ids,
    selectorElement,
    set
  }
}
