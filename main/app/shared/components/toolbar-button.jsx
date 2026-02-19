import { VscodeToolbarButton } from '@vscode-elements/react-elements'
import { asyncNoop } from 'es-toolkit'

import { component } from '../hocs'

export const ToolbarButton = component(
  ({ checked, onChange = asyncNoop, preventToggle, toggleable, ...props }) => (
    <VscodeToolbarButton
      checked={checked}
      onChange={async event => {
        if (preventToggle) event.target.checked = checked

        await onChange(event)
      }}
      toggleable={toggleable ?? preventToggle}
      {...props}
    />
  )
)
