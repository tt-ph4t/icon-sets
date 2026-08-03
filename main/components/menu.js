import {Menu as MenuPrimitive} from '@base-ui/react'
import {isFalsy, isPlainObject, isString} from '@sindresorhus/is'
import {
  VscodeContextMenuItem,
  VscodeFormContainer,
  VscodeFormGroup,
  VscodeIcon
} from '@vscode-elements/react-elements'
import {useControllableValue} from 'ahooks'
import {play} from 'cuelume'
import {omit} from 'es-toolkit'
import {castArray} from 'es-toolkit/compat'
import React from 'react'

import {component} from '../hocs'
import {useMemo} from '../hooks/use-memo'
import {useState} from '../hooks/use-state'
import {hasValues} from '../misc'
import {buildContext} from '../misc/build-context'
import {EMPTY, THEME} from '../misc/constants'
import {getId} from '../misc/get-id'
import {Slot} from './slot'

const Context = buildContext()
const isGroupLabel = isString
const isItem = isPlainObject

const ContextSlot = Object.assign(
  component(({as: Component, selector, ...props}) => {
    const defaultProps = Context.useSelectValue(selector)

    return (
      <Slot {...defaultProps}>
        <Component {...props} />
      </Slot>
    )
  }),
  {
    selectors: ['TriggerProps', 'RootProps', 'ItemProps'].reduce((a, b) => {
      a[b] = ({context: {[b]: c}}) => c

      return a
    }, {})
  }
)

const normalizeData = data =>
  Iterator.from(castArray(data))
    .filter(value => isItem(value) || isGroupLabel(value))
    .map(value => {
      if (isGroupLabel(value)) return value

      const {menu, ...data} = value

      if (isFalsy(data.selected)) delete data.selected

      return {
        menu: normalizeData(menu),
        ...data
      }
    })
    .toArray()

const popup = menu => (
  <MenuPrimitive.Popup
    render={<VscodeFormContainer style={THEME.CARD_STYLE} />}>
    <MenuPrimitive.Group
      render={
        <VscodeFormGroup
          style={{
            maxHeight: 'calc(var(--SPACING) * 120)',
            maxWidth: 'calc(var(--SPACING) * 75)', // virtua ?
            overflow: 'auto',
            padding: 'unset'
          }}
          variant='settings-group'
        />
      }>
      {menu.map(a => {
        if (isGroupLabel(a))
          return (
            <MenuPrimitive.GroupLabel
              key={a}
              render={
                <VscodeContextMenuItem disabled label={a} selected={false} />
              }
            />
          )

        const {menu, separator, ...ItemProps} = a
        const item = <Item {...ItemProps} />

        return (
          <React.Fragment
            key={getId(
              omit(a, ['menu']) // ?
            )}>
            {hasValues(menu) ? (
              <Item.Submenu render={item}>{popup(menu)}</Item.Submenu>
            ) : separator ? (
              Item.Separator
            ) : (
              <ContextSlot
                as={MenuPrimitive.Item}
                render={item}
                selector={ContextSlot.selectors.ItemProps}
              />
            )}
          </React.Fragment>
        )
      })}
    </MenuPrimitive.Group>
  </MenuPrimitive.Popup>
)

const Item = Object.assign(
  component(
    ({checked, description, disabled, keybinding = description, ...props}) => {
      const [selected, setSelected] = useControllableValue(props, {
        defaultValue: false,
        defaultValuePropName: 'defaultSelected',
        trigger: 'onSelectedChange',
        valuePropName: 'selected'
      })

      return (
        <div
          style={{
            position: 'relative'
          }}>
          <Slot.ClickSound
            onMouseEnter={() => {
              play('tick')
              setSelected(true)
            }}
            onMouseLeave={() => {
              setSelected(false)
            }}>
            <VscodeContextMenuItem
              disabled={disabled}
              keybinding={keybinding}
              selected={selected}
              {...props}
            />
          </Slot.ClickSound>
          <React.Activity>
            {checked && (
              <VscodeIcon
                disabled={disabled}
                name='check'
                size={14}
                style={{
                  '--top': '50%',

                  left: 8,
                  pointerEvents: 'none',
                  position: 'absolute',
                  top: 'var(--top)',
                  transform: 'translateY(calc(var(--top) * -1))'
                }}
              />
            )}
          </React.Activity>
        </div>
      )
    }
  ),
  {
    Separator: (
      <MenuPrimitive.Separator render={<VscodeContextMenuItem separator />} />
    ),
    Submenu: component(({children, render, ...props}) => {
      const [state, setState] = useState(false)

      return (
        <Slot onOpenChange={setState}>
          <ContextSlot
            as={MenuPrimitive.SubmenuRoot}
            open={state}
            selector={ContextSlot.selectors.RootProps}
            {...props}>
            <ContextSlot
              as={MenuPrimitive.SubmenuTrigger}
              render={render}
              selected={state}
              selector={ContextSlot.selectors.TriggerProps}
            />
            <React.Activity>
              <MenuPrimitive.Portal>
                <MenuPrimitive.Positioner>{children}</MenuPrimitive.Positioner>
              </MenuPrimitive.Portal>
            </React.Activity>
          </ContextSlot>
        </Slot>
      )
    })
  }
)

export const Menu = component(
  ({
    align = 'start',
    children,
    closeDelay = 0,
    closeOnClick = false,
    closeParentOnEsc = true,
    data = EMPTY.ARRAY,
    delay = 0,
    openOnHover = true,
    render,
    side = 'bottom',
    ...props
  }) => {
    const menu = useMemo(() => normalizeData(data), [data])

    return (
      <Context.Provider
        ItemProps={{
          closeOnClick
        }}
        RootProps={{
          closeParentOnEsc
        }}
        TriggerProps={{
          closeDelay,
          delay,
          openOnHover
        }}>
        <ContextSlot
          as={MenuPrimitive.Root}
          selector={ContextSlot.selectors.RootProps}
          {...props}>
          <ContextSlot
            as={MenuPrimitive.Trigger}
            nativeButton={false}
            render={render}
            selector={ContextSlot.selectors.TriggerProps}>
            {children}
          </ContextSlot>
          <React.Activity>
            {hasValues(menu) && (
              <MenuPrimitive.Portal>
                <MenuPrimitive.Positioner align={align} side={side}>
                  {popup(menu)}
                </MenuPrimitive.Positioner>
              </MenuPrimitive.Portal>
            )}
          </React.Activity>
        </ContextSlot>
      </Context.Provider>
    )
  }
)
