import {isPlainObject} from '@sindresorhus/is'
import {identity, noop} from 'es-toolkit'
import {Slot as SlotPrimitive} from 'radix-ui'
import {renderSlot} from 'render-slot'

import {component} from '../hocs'

export const Slot = Object.assign(component(SlotPrimitive.Root), {
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
