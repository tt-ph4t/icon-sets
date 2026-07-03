import {mergeProps} from '@base-ui/react'
import {VscodeProgressBar} from '@vscode-elements/react-elements'
import {asyncNoop} from 'es-toolkit'
import React from 'react'

import {component} from '../hocs'
import {useCallback} from '../hooks/use-callback'
import {THEME} from '../misc/constants'
import {withImmerAtom} from '../misc/with-immer-atom'

const useStore = withImmerAtom({
  isPending: false
})

export const useProgress = () => {
  const store = useStore()

  const start = useCallback(() => {
    store.set(({draft}) => {
      draft.isPending = true
    })
  })

  const stop = useCallback(() => {
    store.set(({draft}) => {
      draft.isPending = false
    })
  })

  return {
    start,
    stop,
    with: useCallback(async (fn = asyncNoop) => {
      start()

      try {
        return await fn()
      } finally {
        stop()
      }
    })
  }
}

export const Progress = Object.assign(
  component(({visible = false, ...props}) => {
    const {isPending} = useStore().useSelectValue('isPending')

    return (
      <React.Activity mode={isPending || visible ? 'visible' : 'hidden'}>
        <Progress.Bar {...props} />
      </React.Activity>
    )
  }),
  {
    Bar: component(props => (
      <VscodeProgressBar
        {...mergeProps(
          {
            style: {
              '--vscode-progressBar-background': `color-mix(var(${THEME.COLORS.FOREGROUND}) 30%, transparent)`
            }
          },
          props
        )}
      />
    ))
  }
)
