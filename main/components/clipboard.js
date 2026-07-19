import {useBatchedCallback} from '@tanstack/react-pacer'
import ms from 'ms'
import React from 'react'

import {component} from '../hocs'
import {useState} from '../hooks/use-state'
import {copy, hasValues} from '../misc'
import {Slot} from './slot'
import {ToolbarButton} from './toolbar-button'

const initialState = false

export const Clipboard = component(({children, value, ...props}) => {
  const [state, setState] = useState(initialState)

  const resetState = useBatchedCallback(
    () => {
      if (state) setState(initialState)
    },
    {
      wait: ms('1s')
    }
  )

  return (
    <Slot
      onClick={async () => {
        const {isCopied} = await copy(value)

        React.startTransition(() => {
          setState(isCopied)
          resetState()
        })
      }}>
      <ToolbarButton icon={state ? 'check' : 'copy'} {...props}>
        {hasValues(children) && (state ? 'Copied' : children)}
      </ToolbarButton>
    </Slot>
  )
})
