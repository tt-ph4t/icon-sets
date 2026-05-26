import {
  VscodeBadge,
  VscodeFormHelper,
  VscodeSplitLayout
} from '@vscode-elements/react-elements'
import {asyncNoop, delay} from 'es-toolkit'
import ms from 'ms'
import React from 'react'

import {component} from '../hocs'
import {useEffect} from '../hooks/use-effect'
import {useRef} from '../hooks/use-ref'
import {useState} from '../hooks/use-state'
import {hasValues, isOdd} from '../misc'

const minPositionInPercentage = 5

const useIdleEffect = (effect = asyncNoop, {before = asyncNoop, deps}) => {
  const ref = useRef()

  useEffect.async(async () => {
    cancelIdleCallback(ref.current)

    await before()

    ref.current = requestIdleCallback(effect)
  }, deps)
}

const Slot = component(({children, index, positionInPercentage}) => {
  const isSlotEnd = isOdd(index)
  const size = useRef.size()
  const [state, setState] = useState()

  useIdleEffect(
    async () => {
      await delay(ms('1s'))

      React.startTransition(() => {
        setState(false)
      })
    },
    {
      before: () => {
        if (hasValues(state))
          React.startTransition(() => {
            setState(true)
          })
      },
      deps: [size.width, size.height]
    }
  )

  return (
    <div
      slot={isSlotEnd ? 'end' : 'start'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        position: 'relative'
      }}>
      <React.Activity mode={state ? 'visible' : 'hidden'}>
        <VscodeFormHelper
          style={{
            alignSelf: 'center',
            position: 'absolute',
            top: '50%',
            zIndex: 1
          }}>
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
            isSlotEnd
              ? positionInPercentage >= 100 - minPositionInPercentage
                ? 'hidden'
                : 'visible'
              : positionInPercentage <= minPositionInPercentage
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
        onVscSplitLayoutChange={async (...args) => {
          await onVscSplitLayoutChange(...args)

          React.startTransition(() => {
            setState(args[0].detail.positionInPercentage)
          })
        }}
        resetOnDblClick={resetOnDblClick}
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
