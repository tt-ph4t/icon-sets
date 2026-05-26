import {mergeProps} from '@base-ui/react'
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
import {THEME} from '../misc/constants'

const Retry = component(({onClick}) => {
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
      Retry
    </VscodeButton>
  )
})

export const Fallback = Object.assign(
  component(props => (
    <VscodeProgressBar
      {...mergeProps(
        {
          style: {
            '--vscode-progressBar-background': `color-mix(var(${THEME.COLORS.FOREGROUND}) 30%, transparent)`
          }
        },
        props
      )}
    />
  )),
  {
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
          <VscodeProgressBar
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
              <React.Activity mode={isFunction(retryFn) ? 'visible' : 'hidden'}>
                <Retry onClick={retryFn} />
              </React.Activity>
            </VscodeFormHelper>
          </VscodeFormGroup>
        </VscodeFormContainer>
      </div>
    ))
  }
)
