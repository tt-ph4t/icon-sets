import {useBatchedCallback} from '@tanstack/react-pacer'
import React from 'react'

import {component} from '../hocs'
import {useState} from './use-state'

export const useRemount = Object.assign(
  () => {
    const [state, setState] = useState(0)

    const remount = useBatchedCallback(() => {
      setState(state => ++state)
    })

    return Object.assign(remount, {
      icon: 'refresh',
      label: 'Reload',
      get menu() {
        return {
          label: this.label,
          onClick: remount
        }
      },
      state
    })
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
