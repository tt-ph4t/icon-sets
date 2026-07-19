import {VscodeToolbarButton} from '@vscode-elements/react-elements'
import {play} from 'cuelume'

import {component} from '../hocs'
import {Slot} from './slot'

export const ToolbarButton = component(
  ({checked, preventToggle, toggleable, ...props}) => (
    <Slot
      onChange={event => {
        play('toggle')

        if (preventToggle) event.target.checked = checked
      }}>
      <VscodeToolbarButton
        checked={checked}
        toggleable={toggleable ?? preventToggle}
        {...props}
      />
    </Slot>
  )
)
