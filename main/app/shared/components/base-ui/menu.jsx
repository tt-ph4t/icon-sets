import { Menu as menu } from '@base-ui/react/menu'
import { isPlainObject } from '@sindresorhus/is'
import {
  VscodeContextMenuItem,
  VscodeFormContainer
} from '@vscode-elements/react-elements'
import { castArray } from 'es-toolkit/compat'
import React from 'react'
import { VList } from 'virtua'

import { component } from '../../hocs'
import { useState } from '../../hooks'
import { useCallback } from '../../hooks/use-callback'
import { useMemo } from '../../hooks/use-memo'
import { getId, has } from '../../utils'
import { cardStyle } from './utils'

const {
  Item,
  Popup,
  Portal,
  Positioner,
  Root,
  SubmenuRoot,
  SubmenuTrigger,
  Trigger
} = menu

const popupRender = Object.assign(
  (data, children) => {
    const height = 500
    const asVList = data.length > Math.floor(height * 0.1)
    const Popup = asVList ? VList : 'div'

    return (
      <VscodeFormContainer style={cardStyle}>
        <Popup
          style={{
            [asVList ? 'height' : 'maxHeight']: height,
            maxWidth: height * 0.7,
            overflow: 'auto'
          }}>
          {children}
        </Popup>
      </VscodeFormContainer>
    )
  },
  {
    children: (data, context) =>
      data.map(({ menu, render, ...props }, index) => {
        menu = castArray(menu).filter(isPlainObject)

        const itemRender = render ?? <StyledItem {...props} />

        return (
          <React.Fragment key={getId(index, props)}>
            {has(menu) ? (
              <SubmenuRoot>
                <SubmenuTrigger render={itemRender} {...context.TriggerProps} />
                <Portal>
                  <Positioner>
                    <Popup
                      render={popupRender(
                        menu,
                        popupRender.children(menu, context)
                      )}
                    />
                  </Positioner>
                </Portal>
              </SubmenuRoot>
            ) : (
              <Item render={itemRender} {...context.ItemProps} />
            )}
          </React.Fragment>
        )
      })
  }
)

const StyledItem = component(
  ({
    description,
    disabled,
    keybinding = description,
    onMouseOut,
    onMouseOver,
    selected = false,
    ...props
  }) => {
    const [state, setState] = useState(selected)

    const setSelected = useCallback((...args) => {
      if (!(disabled || selected)) setState(...args)
    })

    return (
      <VscodeContextMenuItem
        keybinding={keybinding}
        onMouseOut={async event => {
          setSelected(false)

          await onMouseOut?.(event)
        }}
        onMouseOver={async event => {
          setSelected(true)

          await onMouseOver?.(event)
        }}
        selected={state}
        {...props}
      />
    )
  }
)

export const Menu = component(
  ({
    align = 'start',
    children,
    closeDelay = 0,
    closeOnClick = false,
    data = [],
    delay = 0,
    disabled = false,
    openOnHover = true,
    render,
    side = 'bottom'
  }) => {
    data = useMemo(() => castArray(data).filter(isPlainObject), [data])

    return (
      <Root disabled={disabled}>
        <Trigger
          closeDelay={closeDelay}
          delay={delay}
          nativeButton={false}
          openOnHover={openOnHover}
          render={render}>
          {children}
        </Trigger>
        <Portal>
          <Positioner align={align} side={side}>
            <Popup
              render={popupRender(
                data,
                popupRender.children(data, {
                  ItemProps: { closeOnClick },
                  TriggerProps: { closeDelay, delay, openOnHover }
                })
              )}
            />
          </Positioner>
        </Portal>
      </Root>
    )
  }
)
