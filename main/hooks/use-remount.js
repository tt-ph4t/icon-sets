import {play} from 'cuelume'
import React from 'react'

import {useProgress} from '../components/progress'
import {component} from '../hocs'
import {useCallback} from './use-callback'
import {useState} from './use-state'

const context = {
  hotkey: 'f5',
  icon: 'refresh',
  label: 'Reload'
}

const key = Symbol()

export const useRemount = Object.assign(
  // https://github.com/react-hookz/web/blob/6066c932461c2cd5a88a5f0be658a4d2585d77fc/src/useRerender/index.ts
  () => {
    const [state, setState] = useState(0)
    const progress = useProgress()

    const remount = useCallback(() => {
      play('bloom')

      progress.with(() => {
        setState(state => ++state % Number.MAX_SAFE_INTEGER)
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
