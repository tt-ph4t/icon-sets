import {play} from 'cuelume'

import {component} from '../hocs'
import {Slot} from './slot'

const defaultProps = {
  onChange: () => {
    play('tick')
  }
}

export const ColorPicker = component(({as: Component = 'div', ...props}) => (
  <Slot {...defaultProps}>
    <Component {...props} />
  </Slot>
))
