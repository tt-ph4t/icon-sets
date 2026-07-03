import {isFunction} from '@sindresorhus/is'
import {useBatchedCallback} from '@tanstack/react-pacer'
import {
  VscodeBadge,
  VscodeFormHelper,
  VscodeSplitLayout
} from '@vscode-elements/react-elements'
import {useSetState} from 'ahooks'
import {asyncNoop, delay, omit} from 'es-toolkit'
import ms from 'ms'
import React from 'react'

import {component} from '../hocs'
import {useEffect} from '../hooks/use-effect'
import {useRef} from '../hooks/use-ref'
import {useState} from '../hooks/use-state'
import {hasValues, isOdd} from '../misc'
import {THEME} from '../misc/constants'

const defaults = {
  style: {
    ...omit(THEME.CARD_STYLE, ['padding']),
    height: '100%',
    width: '100%'
  }
}

const useIdleEffect = (fn = asyncNoop, {before = asyncNoop, deps, options}) => {
  const ref = useRef()
  const cleanupRef = useRef()

  useEffect.async(async () => {
    cancelIdleCallback(ref.current)

    await before()

    ref.current = requestIdleCallback(async (...args) => {
      cleanupRef.current = await fn(...args)
    }, options)

    return () => {
      cancelIdleCallback(ref.current)

      if (isFunction(cleanupRef.current)) cleanupRef.current()
    }
  }, deps)
}

const Slot = component(
  ({children, index, positionInPercentage, showSizeHint}) => {
    const isEnd = isOdd(index)
    const size = useRef.size()
    const [state, setState] = useState()

    useIdleEffect(
      async () => {
        if (showSizeHint) {
          await delay(ms('1s'))

          setState(false)
        }
      },
      {
        before: () => {
          if (showSizeHint && hasValues(state)) setState(true)
        },
        deps: [showSizeHint, size]
      }
    )

    return (
      <div
        slot={isEnd ? 'end' : 'start'}
        style={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto'
        }}>
        <React.Activity mode={showSizeHint && state ? 'visible' : 'hidden'}>
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
              isEnd
                ? positionInPercentage >= 100 - 5
                  ? 'hidden'
                  : 'visible'
                : positionInPercentage <= 5
                  ? 'hidden'
                  : 'visible'
            }>
            {children}
          </React.Activity>
        </div>
      </div>
    )
  }
)

export const SplitLayout = component(
  ({
    children,
    onVscSplitLayoutChange = asyncNoop,
    resetOnDblClick = true,
    showSizeHint = false,
    style,
    ...props
  }) => {
    const [state, setState] = useSetState({
      position: undefined,
      positionInPercentage: undefined
    })

    const updateState = useBatchedCallback(setState)

    return (
      <VscodeSplitLayout
        onVscSplitLayoutChange={async (...args) => {
          await onVscSplitLayoutChange(...args)

          updateState(args[0].detail)
        }}
        resetOnDblClick={resetOnDblClick}
        style={
          hasValues(style)
            ? {
                border: 'unset',
                ...style
              }
            : defaults.style
        }
        {...props}>
        {React.Children.map(children, (children, index) => (
          <React.Activity mode={index <= 1 ? 'visible' : 'hidden'}>
            <Slot
              index={index}
              positionInPercentage={state.positionInPercentage}
              showSizeHint={showSizeHint}>
              {children}
            </Slot>
          </React.Activity>
        ))}
      </VscodeSplitLayout>
    )
  }
)
