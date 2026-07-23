import {VscodeToolbarButton} from '@vscode-elements/react-elements'
import {play} from 'cuelume'

import {component} from '../hocs'
import {Slot} from './slot'

const SlotProps = {
  onClick: () => {
    play('release')
  }
}

export const ToolbarButton = component(
  ({checked, preventToggle, toggleable, ...props}) => (
    <Slot
      onChange={event => {
        if (preventToggle) event.target.checked = checked
      }}
      {...SlotProps}>
      <VscodeToolbarButton
        checked={checked}
        toggleable={toggleable ?? preventToggle}
        {...props}
      />
    </Slot>
  )
)
