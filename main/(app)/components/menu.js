import {Menu as menu} from '@base-ui/react/menu'
import {isPlainObject} from '@sindresorhus/is'
import {
  VscodeContextMenuItem,
  VscodeFormContainer,
  VscodeFormGroup
} from '@vscode-elements/react-elements'
import {asyncNoop} from 'es-toolkit'
import {castArray} from 'es-toolkit/compat'
import React from 'react'

import {component} from '../hocs'
import {useCallback} from '../hooks/use-callback'
import {useMemo} from '../hooks/use-memo'
import {useState} from '../hooks/use-state'
import {getId, hasValues} from '../misc'
import {EMPTY_ARRAY, THEME} from '../misc/constants'

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
  (...args) => (
    <VscodeFormContainer style={THEME.CARD_STYLE}>
      <VscodeFormGroup
        style={{
          maxHeight: 500,
          get maxWidth() {
            return this.maxHeight * 0.7
          },
          overflow: 'auto',
          padding: 'unset'
        }}
        variant='settings-group'>
        {popupRender.children(...args)}
      </VscodeFormGroup>
    </VscodeFormContainer>
  ),
  {
    children: (data, context) =>
      data.map(({menu, render, ...props}, index) => {
        menu = castArray(menu).filter(isPlainObject)

        const itemRender = render ?? <StyledItem {...props} />

        return (
          <React.Fragment key={getId(index, props)}>
            {hasValues(menu) ? (
              <SubmenuRoot>
                <SubmenuTrigger render={itemRender} {...context.TriggerProps} />
                <Portal>
                  <Positioner>
                    <Popup render={popupRender(menu, context)} />
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
    keybinding = description,
    onMouseOut = asyncNoop,
    onMouseOver = asyncNoop,
    selected = false,
    ...props
  }) => {
    const [state, setState] = useState(selected)

    const setSelected = useCallback((...args) => {
      if (!selected) setState(...args)
    })

    return (
      <VscodeContextMenuItem
        keybinding={keybinding}
        onMouseOut={async event => {
          setSelected(false)

          await onMouseOut(event)
        }}
        onMouseOver={async event => {
          setSelected(true)

          await onMouseOver(event)
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
    data = EMPTY_ARRAY,
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
        {hasValues(data) && (
          <Portal>
            <Positioner align={align} side={side}>
              <Popup
                render={popupRender(data, {
                  ItemProps: {closeOnClick},
                  TriggerProps: {closeDelay, delay, openOnHover}
                })}
              />
            </Positioner>
          </Portal>
        )}
      </Root>
    )
  }
)
