import {identity, noop} from 'es-toolkit'
import React from 'react'
import {renderSlot as internalRenderSlot} from 'render-slot'

export const renderSlot = ({context, wrapper = identity, ...props}) => (
  <React.Activity>
    {internalRenderSlot({
      context: {
        context
      },
      wrapper,
      ...props,
      default: props.default ?? noop
    })}
  </React.Activity>
)
