import {Input as InputPrimitive} from '@base-ui/react'
import {play} from 'cuelume'

import {component} from '../hocs'
import {Slot} from './slot'

const SlotProps = {
  onInput: () => {
    play('press')
  }
}

export const Input = component(({as: Component = InputPrimitive, ...props}) => (
  <Slot {...SlotProps}>
    <Component {...props} />
  </Slot>
))
