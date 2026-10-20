import {Input as InputPrimitive} from '@base-ui/react'
import {useHotkey} from '@tanstack/react-hotkeys'
import {play} from 'cuelume'

import {component} from '../hocs'
import {useRef} from '../hooks/use-ref'
import {useState} from '../hooks/use-state'
import {Slot} from './slot'

const defaultProps = {
  onInputCapture: () => {
    play('tick')
  }
}

export const Input = component(
  ({as: Component = InputPrimitive, placeholder, ...props}) => {
    const [state, setState] = useState(true)
    const ref = useRef()

    useHotkey('esc', () => {
      ref.current.blur()
    })

    return (
      <Slot
        onBlur={() => {
          setState(true)
        }}
        onFocus={() => {
          setState(false)
        }}
        ref={ref}
        {...defaultProps}>
        <Component placeholder={state ? placeholder : undefined} {...props} />
      </Slot>
    )
  }
)
