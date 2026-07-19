import {isFunction} from '@sindresorhus/is'
import {useThrottledCallback} from '@tanstack/react-pacer'
import {
  VscodeBadge,
  VscodeFormHelper,
  VscodeSplitLayout
} from '@vscode-elements/react-elements'
import {useSetState} from 'ahooks'
import {play} from 'cuelume'
import {asyncNoop, delay, omit} from 'es-toolkit'
import ms from 'ms'
import React from 'react'

import {component} from '../hocs'
import {useEffect} from '../hooks/use-effect'
import {useRef} from '../hooks/use-ref'
import {useState} from '../hooks/use-state'
import {hasValues, isOdd} from '../misc'
import {THEME} from '../misc/constants'
import {Slot} from './slot'

const defaultStyle = {
  ...omit(THEME.CARD_STYLE, ['padding']),
  '--size': '100%',

  height: 'var(--size)',
  width: 'var(--size)'
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

const Item = component(
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
              'visible' || // ?
              (isEnd
                ? positionInPercentage >= 100 - 5
                  ? 'hidden'
                  : 'visible'
                : positionInPercentage <= 5
                  ? 'hidden'
                  : 'visible')
            }>
            {children}
          </React.Activity>
        </div>
      </div>
    )
  }
)

export const SplitLayout = component(
  ({children, showSizeHint = false, style, ...props}) => {
    const [state, setState] = useSetState({
      position: undefined,
      positionInPercentage: undefined
    })

    const updateState = useThrottledCallback(setState)

    return (
      <Slot
        onVscSplitLayoutChange={event => {
          play('release')
          updateState(event.detail)
        }}>
        <VscodeSplitLayout
          resetOnDblClick
          style={
            hasValues(style)
              ? {
                  border: 'unset',
                  ...style
                }
              : defaultStyle
          }
          {...props}>
          {React.Children.map(children, (children, index) => (
            <React.Activity mode={index <= 1 ? 'visible' : 'hidden'}>
              <Item
                index={index}
                positionInPercentage={state.positionInPercentage}
                showSizeHint={showSizeHint}>
                {children}
              </Item>
            </React.Activity>
          ))}
        </VscodeSplitLayout>
      </Slot>
    )
  }
)
