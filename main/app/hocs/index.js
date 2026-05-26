import {isEqual} from '@ver0/deep-equal'
import React from 'react'

import {useCallback} from '../hooks/use-callback'

useCallback // ?

export const component = (Component = React.Fragment) =>
  React.memo(
    props => (
      <React.Activity>
        <Component {...props} />
      </React.Activity>
    ),
    isEqual
  )
