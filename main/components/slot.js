import {isPlainObject} from '@sindresorhus/is'
import {play} from 'cuelume'
import {identity, noop} from 'es-toolkit'
import {Slot as SlotPrimitive} from 'radix-ui'
import {renderSlot} from 'render-slot'

import {component} from '../hocs'
import {isSyncFunction} from '../misc'

const InteractiveProps = {
  onClick: () => {
    play('release')
  },
  onMouseEnter: () => {
    play('tick')
  }
}

export const Slot = Object.assign(component(SlotPrimitive.Root), {
  Interactive: component(props => (
    <Slot {...InteractiveProps}>
      <Slot {...props} />
    </Slot>
  )),
  render: value => {
    if (isPlainObject(value)) {
      const {context, wrapper = identity, ...props} = value

      return renderSlot({
        context: {
          context
        },
        wrapper,
        ...props,
        default: props.default ?? noop
      })
    }

    if (isSyncFunction(value)) return renderSlot(value)
  },
  Slottable: component(SlotPrimitive.Slottable)
})
