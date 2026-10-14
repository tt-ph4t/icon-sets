import {Menu as MenuPrimitive} from '@base-ui/react'
import {
  VscodeContextMenuItem,
  VscodeFormContainer,
  VscodeFormGroup,
  VscodeIcon
} from '@vscode-elements/react-elements'
import {useControllableValue} from 'ahooks'
import {omit} from 'es-toolkit'
import React from 'react'

import {component} from '../../hocs'
import {useState} from '../../hooks/use-state'
import {hasValues} from '../../misc'
import {THEME} from '../../misc/constants'
import {getId} from '../../misc/get-id'
import {Slot} from '../slot'
import {ContextSlot, isGroupLabel} from './misc'

const popupRender = <VscodeFormContainer style={THEME.CARD_STYLE} />

const groupRender = (
  <VscodeFormGroup
    style={{
      maxHeight: 'calc(var(--SPACING) * 120)',
      maxWidth: 'calc(var(--SPACING) * 75)', // virtua ?
      overflow: 'auto',
      padding: 'unset'
    }}
    variant='settings-group'
  />
)

const Icon = component(props => (
  <Slot
    style={{
      '--top': '50%',

      left: 8,
      pointerEvents: 'none',
      position: 'absolute',
      top: 'var(--top)',
      transform: 'translateY(calc(var(--top) * -1))'
    }}>
    <VscodeIcon size={14} {...props} />
  </Slot>
))

const Item = Object.assign(
  component(
    ({
      checked,
      description,
      disabled,
      icon,
      keybinding = description,
      ...props
    }) => {
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
          <Slot.Cuelume.Hover
            onPointerEnter={() => {
              setSelected(true)
            }}
            onPointerLeave={() => {
              setSelected(false)
            }}>
            <Slot.Cuelume.Press>
              <VscodeContextMenuItem
                disabled={disabled}
                keybinding={keybinding}
                selected={selected}
                {...props}
              />
            </Slot.Cuelume.Press>
          </Slot.Cuelume.Hover>
          {checked && <Icon disabled={disabled} name='check' />}
          {checked ||
            (hasValues(icon) && <Icon disabled={disabled} name={icon} />)}
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
            <MenuPrimitive.Portal>
              <MenuPrimitive.Positioner>{children}</MenuPrimitive.Positioner>
            </MenuPrimitive.Portal>
          </ContextSlot>
        </Slot>
      )
    })
  }
)

const popup = menu => (
  <MenuPrimitive.Popup render={popupRender}>
    <MenuPrimitive.Group render={groupRender}>
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

export default popup
