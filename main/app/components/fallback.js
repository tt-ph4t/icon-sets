import {isFunction} from '@sindresorhus/is'
import {
  VscodeButton,
  VscodeFormContainer,
  VscodeFormGroup,
  VscodeFormHelper,
  VscodeLabel,
  VscodeProgressBar
} from '@vscode-elements/react-elements'
import {delay, negate} from 'es-toolkit'
import ms from 'ms'
import React from 'react'

import {component} from '../hocs'
import {useState} from '../hooks/use-state'

const TryAgain = component(({onClick}) => {
  const [state, setState] = useState(false)

  return (
    <VscodeButton
      block
      disabled={state}
      icon={state ? 'loading' : 'debug-rerun'}
      iconSpin={state}
      onClick={async (...args) => {
        React.startTransition(() => {
          setState(negate)
        })

        await delay(ms('1s'))
        await onClick(...args)
      }}
      style={{width: 'fit-content'}}
      type='reset'>
      Try again
    </VscodeButton>
  )
})

export const Fallback = Object.assign(
  component(() => (
    <VscodeProgressBar
      style={{
        '--vscode-progressBar-background': 'var(--vscode-badge-background)'
      }}
    />
  )),
  {
    Error: component(({message, progressBar = true, tryAgainFn}) => (
      <div
        style={{
          '--size': '100%',

          display: 'flex',
          flexDirection: 'column',
          height: 'var(--size)',
          width: 'var(--size)'
        }}>
        <React.Activity mode={progressBar ? 'visible' : 'hidden'}>
          <VscodeProgressBar
            style={{
              '--vscode-progressBar-background':
                'var(--vscode-activityErrorBadge-background)'
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
              <React.Activity
                mode={isFunction(tryAgainFn) ? 'visible' : 'hidden'}>
                <TryAgain onClick={tryAgainFn} />
              </React.Activity>
            </VscodeFormHelper>
          </VscodeFormGroup>
        </VscodeFormContainer>
      </div>
    ))
  }
)
