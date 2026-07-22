import {play} from 'cuelume'
import {ResizableBox, Resizable as ResizablePrimitive} from 'react-resizable'

import {component} from '../../hocs'
import {Slot} from '../slot'
import './index.css'

const SlotProps = {
  onResize: () => {
    play('tick')
  }
}

export const Resizable = Object.assign(
  component(({as: Component = ResizablePrimitive, ...props}) => (
    <Slot {...SlotProps}>
      <Component {...props} />
    </Slot>
  )),
  {
    Box: component(ResizableBox)
  }
)
