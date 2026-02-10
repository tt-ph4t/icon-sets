import {
  VscodeBadge,
  VscodeFormHelper,
  VscodeSplitLayout
} from '@vscode-elements/react-elements'
import { asyncNoop, noop } from 'es-toolkit'
import React from 'react'

import { component } from '../hocs'
import { useState } from '../hooks'
import { useEffect } from '../hooks/use-effect'
import { useRef } from '../hooks/use-ref'
import { useSize } from '../hooks/use-size'
import { checkOdd, has } from '../utils'

const minPositionInPercentage = 5

const useDebounceEffect = (
  effect = asyncNoop,
  { beforeEffect = noop, delay = import.meta.env.VITE_DELAY_MS, deps }
) => {
  const ref = useRef()

  useEffect(() => {
    clearTimeout(ref.current)
    beforeEffect()

    ref.current = setTimeout(effect, delay)
  }, deps)
}

const Slot = component(({ children, index, positionInPercentage }) => {
  const isSlotStat = !checkOdd(index)
  const size = useSize()
  const [state, setState] = useState()

  useDebounceEffect(
    () => {
      setState(false)
    },
    {
      beforeEffect: () => {
        if (has(state)) setState(true)
      },
      delay: 1000,
      deps: [size]
    }
  )

  return (
    <div
      slot={isSlotStat ? 'start' : 'end'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto'
      }}>
      <React.Activity mode={state ? 'visible' : 'hidden'} mode='hidden'>
        <VscodeFormHelper>
          <VscodeBadge>
            {size.width} x {size.height}
          </VscodeBadge>
        </VscodeFormHelper>
      </React.Activity>
      <div
        ref={size.ref}
        style={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1
        }}>
        <React.Activity
          mode={
            isSlotStat
              ? positionInPercentage <= minPositionInPercentage
                ? 'hidden'
                : 'visible'
              : positionInPercentage >= 100 - minPositionInPercentage
                ? 'hidden'
                : 'visible'
          }>
          {children}
        </React.Activity>
      </div>
    </div>
  )
})

export const SplitLayout = component(
  ({
    children,
    onVscSplitLayoutChange = asyncNoop,
    resetOnDblClick = true,
    ...props
  }) => {
    const [state, setState] = useState()

    return (
      <VscodeSplitLayout
        onVscSplitLayoutChange={async event => {
          await onVscSplitLayoutChange(event)

          React.startTransition(() => {
            setState(event.detail.positionInPercentage)
          })
        }}
        resetOnDblClick={resetOnDblClick} // ?
        {...props}>
        {React.Children.map(children, (children, index) => (
          <React.Activity mode={index <= 1 ? 'visible' : 'hidden'}>
            <Slot index={index} positionInPercentage={state}>
              {children}
            </Slot>
          </React.Activity>
        ))}
      </VscodeSplitLayout>
    )
  }
)
