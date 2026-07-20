import {isPlainObject} from '@sindresorhus/is'
import {play} from 'cuelume'
import {identity, noop} from 'es-toolkit'
import {Slot as SlotPrimitive} from 'radix-ui'
import {renderSlot} from 'render-slot'

import {component} from '../hocs'

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
  render: options => {
    if (isPlainObject(options)) {
      const {context, wrapper = identity, ...props} = options

      return renderSlot({
        context: {
          context
        },
        wrapper,
        ...props,
        default: props.default ?? noop
      })
    }

    return renderSlot(options)
  },
  Slottable: component(SlotPrimitive.Slottable)
})
