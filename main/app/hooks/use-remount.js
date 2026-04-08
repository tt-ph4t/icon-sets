import {useBatcher} from '@tanstack/react-pacer/batcher'
import {last} from 'es-toolkit'
import React from 'react'

import {component} from '../hocs'
import {useMemo} from './use-memo'
import {useState} from './use-state'

export const useRemount = Object.assign(
  () => {
    const [state, setState] = useState(0)

    const batcher = useBatcher(items => {
      last(items)()
    })

    return useMemo(() => {
      const remount = () => {
        batcher.addItem(() => {
          setState(state => ++state)
        })
      }

      return Object.assign(remount, {
        batcher,
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
    }, [batcher, state])
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
