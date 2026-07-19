import {play} from 'cuelume'
import {ResizableBox, Resizable as ResizablePrimitive} from 'react-resizable'

import {component} from '../../hocs'
import {Slot} from '../slot'
import './index.css'

const defaultProps = {
  onResize: () => {
    play('tick')
  }
}

export const Resizable = Object.assign(
  component(props => (
    <Slot {...defaultProps}>
      <ResizablePrimitive {...props} />
    </Slot>
  )),
  {
    Box: component(props => (
      <Slot {...defaultProps}>
        <ResizableBox {...props} />
      </Slot>
    ))
  }
)
