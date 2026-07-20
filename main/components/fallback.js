import {isFunction} from '@sindresorhus/is'
import {
  VscodeButton,
  VscodeFormContainer,
  VscodeFormGroup,
  VscodeFormHelper,
  VscodeLabel
} from '@vscode-elements/react-elements'
import {asyncNoop, delay, negate} from 'es-toolkit'
import ms from 'ms'
import React from 'react'

import {component} from '../hocs'
import {useState} from '../hooks/use-state'
import {THEME} from '../misc/constants'
import {Progress} from './progress'
import {Slot} from './slot'

const Retry = component(({onClick = asyncNoop, ...props}) => {
  const [state, setState] = useState(false)

  return (
    <Slot
      style={{
        width: 'fit-content'
      }}>
      <VscodeButton
        block
        disabled={state}
        icon={state ? 'loading' : 'debug-rerun'}
        iconSpin={state}
        onClick={async (...args) => {
          React.startTransition(() => {
            setState(negate)
          })

          await delay(ms('.6s'))
          await onClick(...args) // ?
        }}
        type='reset'
        {...props}>
        Retry
      </VscodeButton>
    </Slot>
  )
})

export const Fallback = {
  Error: component(({message, progressBar = true, retryFn}) => (
    <div
      style={{
        '--size': '100%',

        display: 'flex',
        flexDirection: 'column',
        height: 'var(--size)',
        width: 'var(--size)'
      }}>
      <React.Activity mode={progressBar ? 'visible' : 'hidden'}>
        <Progress.Bar
          style={{
            '--vscode-progressBar-background': `var(${THEME.COLORS.ERROR})`
          }}
        />
      </React.Activity>
      <VscodeFormContainer
        style={{
          alignContent: 'center',
          alignSelf: 'center',
          flexGrow: 1
        }}>
        <VscodeFormGroup variant='settings-group'>
          <VscodeLabel required>Error</VscodeLabel>
          <VscodeFormHelper>
            {message}
            {isFunction(retryFn) && <Retry onClick={retryFn} />}
          </VscodeFormHelper>
        </VscodeFormGroup>
      </VscodeFormContainer>
    </div>
  ))
}
