import {
  VscodeButton,
  VscodeFormContainer,
  VscodeFormGroup,
  VscodeFormHelper,
  VscodeLabel,
  VscodeProgressBar
} from '@vscode-elements/react-elements'

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
    Error: component(props => (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}>
        <VscodeProgressBar
          style={{
            '--vscode-progressBar-background':
              'var(--vscode-activityErrorBadge-background)'
          }}
        />
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
