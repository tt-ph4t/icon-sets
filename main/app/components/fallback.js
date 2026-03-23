import {
  VscodeButton,
  VscodeFormContainer,
  VscodeFormGroup,
  VscodeFormHelper,
  VscodeLabel,
  VscodeProgressBar
} from '@vscode-elements/react-elements'
import React from 'react'

import {component} from '../hocs'
import {has} from '../utils'

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
              <React.Activity mode={has(tryAgainFn) ? 'visible' : 'hidden'}>
                <VscodeButton
                  block
                  icon='debug-rerun'
                  onClick={tryAgainFn}
                  style={{width: 'fit-content'}}
                  type='reset'>
                  Try Again
                </VscodeButton>
              </React.Activity>
            </VscodeFormHelper>
          </VscodeFormGroup>
        </VscodeFormContainer>
      </div>
    ))
  }
)
