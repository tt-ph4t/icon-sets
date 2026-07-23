import {play} from 'cuelume'

import {component} from '../hocs'
import {Slot} from './slot'

const SlotProps = {
  onChange: () => {
    play('tick')
  }
}

export const ColorPicker = component(({as: Component = 'div', ...props}) => (
  <Slot {...SlotProps}>
    <Component {...props} />
  </Slot>
))
