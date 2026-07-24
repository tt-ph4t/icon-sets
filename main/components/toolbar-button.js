import {VscodeToolbarButton} from '@vscode-elements/react-elements'

import {component} from '../hocs'
import {Slot} from './slot'

export const ToolbarButton = component(
  ({checked, preventToggle, toggleable, ...props}) => (
    <Slot.Interactive
      onChange={event => {
        if (preventToggle) event.target.checked = checked
      }}>
      <VscodeToolbarButton
        checked={checked}
        toggleable={toggleable ?? preventToggle}
        {...props}
      />
    </Slot.Interactive>
  )
)
