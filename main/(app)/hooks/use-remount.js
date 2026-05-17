import {useBatcher} from '@tanstack/react-pacer'
import {last} from 'es-toolkit'
import React from 'react'

import {component} from '../hocs'
import {useCallback} from './use-callback'
import {useState} from './use-state'

export const useRemount = Object.assign(
  () => {
    const [state, setState] = useState(0)

    const batcher = useBatcher(items => {
      last(items)()
    })

    const remount = useCallback(() => {
      batcher.addItem(() => {
        setState(state => ++state)
      })
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
