import React from 'react'

import { component } from '../hocs'
import { useCallback } from './use-callback'
import { useState } from './use-state'

export const useRemount = Object.assign(
  () => {
    const [state, setState] = useState(0)

    return Object.assign(
      useCallback(() => {
        setState(state => ++state)
      }),
      {
        icon: 'refresh',
        label: 'Reload',
        state
      }
    )
  },
  {
    with: Component =>
      component(props => {
        const remount = useRemount()

        return (
          <React.Fragment key={remount.state}>
            <Component {...props} INTERNAL_REMOUNT={remount} />
          </React.Fragment>
        )
      })
  }
)
