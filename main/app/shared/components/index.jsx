import { VscodeProgressBar } from '@vscode-elements/react-elements'

export const progressBar = {
  default: (
    <VscodeProgressBar
      style={{
        '--vscode-progressBar-background': 'var(--vscode-badge-foreground)'
      }}
    />
  ),
  error: (
    <VscodeProgressBar
      style={{
        '--vscode-progressBar-background':
          'var(--vscode-activityErrorBadge-background)'
      }}
    />
  )
}
