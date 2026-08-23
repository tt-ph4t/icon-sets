import {isPlainObject} from '@sindresorhus/is'
import {play} from 'cuelume'
import {identity, mapValues, noop} from 'es-toolkit'
import {Slot as SlotPrimitive} from 'radix-ui'
import {renderSlot} from 'render-slot'

import {component} from '../hocs'
import {isSyncFunction} from '../misc'

export const Slot = Object.assign(
  // mergeProps
  // on*, style, className, ref, aria-describedby
  component(SlotPrimitive.Root),
  {
    Cuelume: mapValues(
      {
        Hover: {
          onPointerEnter: () => {
            play('tick')
          }
        },
        Press: {
          onPointerDown: () => {
            play('press')
          },
          onPointerUp: () => {
            play('release')
          }
        }
      },
      defaultProps =>
        component(props => (
          <Slot {...defaultProps}>
            <Slot {...props} />
          </Slot>
        ))
    ),
    render: value => {
      if (isPlainObject(value)) {
        const {context, options, wrapper = identity, ...props} = value

        return renderSlot({
          context: {
            context
          },
          options: {
            // passContextToDefault: true,
            ...options
          },
          wrapper,
          ...props,
          default: props.default ?? noop
        })
      }

      if (isSyncFunction(value)) return renderSlot(value)
    }
  }
)
