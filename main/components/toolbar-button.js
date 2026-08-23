import {VscodeToolbarButton} from '@vscode-elements/react-elements'

import {component} from '../hocs'
import {Slot} from './slot'

export const ToolbarButton = component(
  ({checked, controlled, toggleable, ...props}) => (
    <Slot.Cuelume.Press
      onChange={event => {
        if (controlled) event.target.checked = checked
      }}>
      <VscodeToolbarButton
        checked={checked}
        toggleable={toggleable ?? controlled}
        {...props}
      />
    </Slot.Cuelume.Press>
  )
)
