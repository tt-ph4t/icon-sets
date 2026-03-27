import React from 'react'
import {renderSlot as render} from 'render-slot'

export const renderSlot = ({
  context,
  default: d = React.Fragment,
  ...props
}) => (
  <React.Activity>
    {render({
      context: {context},
      default: d,
      ...props
    })}
  </React.Activity>
)
