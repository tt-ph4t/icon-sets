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

export const Fallback = Object.assign(
  component(() => (
    <VscodeProgressBar
      style={{
        '--vscode-progressBar-background': 'var(--vscode-badge-background)'
      }}
    />
  )),
  {
    Error: component(({progressBar = true, ...props}) => (
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
            <VscodeFormHelper {...props} />
          </VscodeFormGroup>
        </VscodeFormContainer>
      </div>
    )),
    TryAgainButton: component(
      ({
        block = true,
        icon = 'debug-rerun',
        style,
        type = 'reset',
        ...props
      }) => (
        <VscodeButton
          block={block}
          icon={icon}
          style={{width: 'fit-content', ...style}}
          type={type}
          {...props}>
          Try Again
        </VscodeButton>
      )
    )
  }
)
