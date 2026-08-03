import {isFunction} from '@sindresorhus/is'
import {
  VscodeFormContainer,
  VscodeFormGroup,
  VscodeFormHelper,
  VscodeLabel
} from '@vscode-elements/react-elements'
import {negate} from 'es-toolkit'
import React from 'react'
import {getErrorMessage} from 'react-error-boundary'

import {component} from '../hocs'
import {useState} from '../hooks/use-state'
import {THEME} from '../misc/constants'
import {Button} from './button'
import {Progress} from './progress'
import {Slot} from './slot'

const Retry = component(props => {
  const [state, setState] = useState(false)

  return (
    <Slot
      onClick={() => {
        setState(negate)
      }}
      style={{
        width: 'fit-content'
      }}>
      <Button
        block
        disabled={state}
        icon={state ? 'loading' : 'debug-rerun'}
        iconSpin={state}
        type='reset'
        {...props}>
        Retry
      </Button>
    </Slot>
  )
})

export const Fallback = {
  Error: component(({error, onRetry, progressBar = true}) => (
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
            {getErrorMessage(error)}
            {isFunction(onRetry) && <Retry onClick={onRetry} />}
          </VscodeFormHelper>
        </VscodeFormGroup>
      </VscodeFormContainer>
    </div>
  )),
  ProgressBar: <Progress.Bar />
}
