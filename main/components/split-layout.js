import {isFunction} from '@sindresorhus/is'
import {
  VscodeBadge,
  VscodeFormHelper,
  VscodeSplitLayout
} from '@vscode-elements/react-elements'
import {useSetState} from 'ahooks'
import {play} from 'cuelume'
import {asyncNoop, delay, omit, pick} from 'es-toolkit'
import React from 'react'

import {component} from '../hocs'
import {useEffect} from '../hooks/use-effect'
import {useRef} from '../hooks/use-ref'
import {useState} from '../hooks/use-state'
import {hasValues, isOdd, sizeLabel} from '../misc'
import {buildContext} from '../misc/build-context'
import {THEME} from '../misc/constants'
import {Slot} from './slot'

const Context = buildContext({
  position: undefined,
  positionInPercentage: undefined
})

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

    await Promise.try(before)

    ref.current = requestIdleCallback(async (...args) => {
      cleanupRef.current = await Promise.try(async () => await fn(...args))
    }, options)

    return async () => {
      cancelIdleCallback(ref.current)

      if (isFunction(cleanupRef.current)) await Promise.try(cleanupRef.current)
    }
  }, deps)
}

const Item = component(
  ({aaaaaaaaaaaaa = 0, children, showSizeHint, ...props}) => {
    const size = useRef.size()
    const [state, setState] = useState()

    const context = Context.useSelectValue(({context}) =>
      pick(context, ['positionInPercentage', 'index'])
    )

    const isSlotEnd = isOdd(context.index)

    useIdleEffect(
      async () => {
        if (showSizeHint) {
          await delay(1000)

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
      <Slot
        style={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto'
        }}>
        <div slot={isSlotEnd ? 'end' : 'start'} {...props}>
          {showSizeHint && state && (
            <VscodeFormHelper
              style={{
                alignSelf: 'center',
                position: 'absolute',
                top: '50%',
                zIndex: 1
              }}>
              <VscodeBadge>{sizeLabel(size)}</VscodeBadge>
            </VscodeFormHelper>
          )}
          <div
            ref={size.ref}
            style={{
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1
            }}>
            {(isSlotEnd
              ? context.positionInPercentage >= 100 - aaaaaaaaaaaaa
              : context.positionInPercentage <= aaaaaaaaaaaaa) || children}
          </div>
        </div>
      </Slot>
    )
  }
)

export const SplitLayout = component(
  ({children, showSizeHint = false, style, ...props}) => {
    const [state, setState] = useSetState(Context.initial)

    return (
      <Slot
        onVscSplitLayoutChange={event => {
          play('release')
          setState(event.detail)
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
          {React.Children.map(
            children,
            (children, index) =>
              index <= 1 && (
                <Context.Provider index={index} {...state}>
                  <Item aaaaaaaaaaaaa={5} showSizeHint={showSizeHint}>
                    {children}
                  </Item>
                </Context.Provider>
              )
          )}
        </VscodeSplitLayout>
      </Slot>
    )
  }
)
