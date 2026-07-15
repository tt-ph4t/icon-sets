import {useAsyncBatchedCallback} from '@tanstack/react-pacer'
import React from 'react'

import {useProgress} from '../components/progress'
import {component} from '../hocs'
import {useState} from './use-state'

const context = {
  icon: 'refresh',
  label: 'Reload'
}

const key = Symbol()

export const useRemount = Object.assign(
  () => {
    const [state, setState] = useState(0)
    const progress = useProgress()

    const remount = useAsyncBatchedCallback(async () => {
      await progress.with(() => {
        setState(state => ++state)
      })
    })

    return Object.assign(remount, {
      ...context,
      menu: {
        label: context.label,
        onClick: remount
      },
      state
    })
  },
  {
    key,
    with: Component =>
      component(props => {
        const remount = useRemount()

        return (
          <React.Fragment key={remount.state}>
            <Component
              {...props}
              {...{
                [key]: remount
              }}
            />
          </React.Fragment>
        )
      })
  }
)
