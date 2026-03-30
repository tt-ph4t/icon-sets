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

const useIdleAsyncEffect = (
  effect = asyncNoop,
  {beforeEffect = asyncNoop, deps}
) => {
  const ref = useRef()

  useEffect.Async(async () => {
    cancelIdleCallback(ref.current)
    await beforeEffect()

    ref.current = requestIdleCallback(effect)
  }, deps)
}

const Slot = component(({children, index, positionInPercentage}) => {
  const isSlotStat = !isOdd(index)
  const size = useRef.Size()
  const [state, setState] = useState()

  useIdleAsyncEffect(
    async () => {
      await delay(ms('1s'))

      React.startTransition(() => {
        setState(false)
      })
    },
    {
      beforeEffect: () => {
        if (hasValues(state)) setState(true)
      },
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
