import {VscodeProgressBar} from '@vscode-elements/react-elements'
import {asyncNoop} from 'es-toolkit'
import React from 'react'

import {component} from '../hocs'
import {useCallback} from '../hooks/use-callback'
import {THEME} from '../misc/constants'
import {withImmerAtom} from '../misc/with-immer-atom'
import {Slot} from './slot'

const useStore = withImmerAtom({
  visible: false
})

export const useProgress = () => {
  const store = useStore()

  const start = useCallback(() => {
    store.set(({draft}) => {
      draft.visible = true
    })
  })

  const stop = useCallback(() => {
    store.set(({draft}) => {
      draft.visible = false
    })
  })

  return {
    start,
    stop,
    with: useCallback(async (fn = asyncNoop) => {
      start()

      const data = await Promise.try(fn)

      stop()

      return data
    })
  }
}

export const ProgressBar = Object.assign(
  component(props => (
    <Slot
      style={{
        '--vscode-progressBar-background': `color-mix(${THEME.COLORS.FOREGROUND} 30%, transparent)`
      }}>
      <VscodeProgressBar {...props} />
    </Slot>
  )),
  {
    Global: component(({visible = false, ...props}) => {
      const state = useStore().useValue()

      return (
        <React.Activity mode={state.visible || visible ? 'visible' : 'hidden'}>
          <ProgressBar {...props} />
        </React.Activity>
      )
    })
  }
)
