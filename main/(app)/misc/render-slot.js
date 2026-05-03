import React from 'react'
import {renderSlot as render} from 'render-slot'

export const renderSlot = ({
  context,
  default: internalDefault = React.Fragment,
  ...props
}) => (
  <React.Activity>
    {render({
      context: {context},
      default: internalDefault,
      ...props
    })}
  </React.Activity>
)
