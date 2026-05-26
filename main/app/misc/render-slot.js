import React from 'react'
import {renderSlot as internalRenderSlot} from 'render-slot'

export const renderSlot = ({
  context,
  default: internalDefault = React.Fragment,
  ...props
}) => (
  <React.Activity>
    {internalRenderSlot({
      context: {context},
      default: internalDefault,
      ...props
    })}
  </React.Activity>
)
