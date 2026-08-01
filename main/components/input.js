import {Input as InputPrimitive} from '@base-ui/react'
import {play} from 'cuelume'

import {component} from '../hocs'
import {useState} from '../hooks/use-state'
import {Slot} from './slot'

const defaultProps = {
  onFocusCapture: () => {
    play('release')
  },
  onInputCapture: () => {
    play('press')
  }
}

export const Input = component(
  ({as: Component = InputPrimitive, placeholder, ...props}) => {
    const [state, setState] = useState(true)

    return (
      <Slot
        onBlur={() => {
          setState(true)
        }}
        onFocus={() => {
          setState(false)
        }}
        {...defaultProps}>
        <Component placeholder={state ? placeholder : undefined} {...props} />
      </Slot>
    )
  }
)
