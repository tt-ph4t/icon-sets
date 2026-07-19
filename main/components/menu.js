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
import {identity, omit} from 'es-toolkit'
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

const isGroupLabel = isString

const normalizeData = data =>
  Iterator.from(castArray(data))
    .filter(value => isPlainObject(value) || isGroupLabel(value))
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

const {Provider: PopupProvider, useContext: usePopupContext} = buildContext()

const Popup = component(({menu}) => {
  const context = usePopupContext(identity)

  return (
    <MenuPrimitive.Popup
      render={
        <VscodeFormContainer style={THEME.CARD_STYLE}>
          <MenuPrimitive.Group
            render={
              <VscodeFormGroup
                style={{
                  maxHeight: 'calc(var(--SPACING) * 120)',
                  maxWidth: 'calc(var(--SPACING) * 75)', // virtua ?
                  overflow: 'auto',
                  padding: 'unset'
                }}
                variant='settings-group'>
                {menu.map((data, index) => {
                  if (isGroupLabel(data))
                    return (
                      <MenuPrimitive.GroupLabel
                        key={getId(index, data)}
                        render={
                          <VscodeContextMenuItem
                            disabled
                            label={data}
                            selected={false}
                          />
                        }
                      />
                    )

                  const {menu, separator, ...ItemProps} = data
                  const item = <Item {...ItemProps} />

                  return (
                    <React.Fragment
                      key={getId(
                        index,
                        omit(data, ['menu']) // ?
                      )}>
                      {hasValues(menu) ? (
                        <Item.Submenu {...context.TriggerProps} render={item}>
                          <Popup menu={menu} />
                        </Item.Submenu>
                      ) : separator ? (
                        Item.Separator
                      ) : (
                        <MenuPrimitive.Item
                          {...context.ItemProps}
                          render={item}
                        />
                      )}
                    </React.Fragment>
                  )
                })}
              </VscodeFormGroup>
            }
          />
        </VscodeFormContainer>
      }
    />
  )
})

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
          <Slot
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
          </Slot>
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
        </div>
      )
    }
  ),
  {
    Separator: (
      <MenuPrimitive.Separator render={<VscodeContextMenuItem separator />} />
    ),
    Submenu: component(({children, ...props}) => {
      const [state, setState] = useState(false)

      return (
        <Slot onOpenChange={setState}>
          <MenuPrimitive.SubmenuRoot>
            <MenuPrimitive.SubmenuTrigger {...props} selected={state} />
            <MenuPrimitive.Portal>
              <MenuPrimitive.Positioner>{children}</MenuPrimitive.Positioner>
            </MenuPrimitive.Portal>
          </MenuPrimitive.SubmenuRoot>
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
    data = EMPTY.ARRAY,
    delay = 0,
    openOnHover = true,
    render,
    side = 'bottom',
    ...props
  }) => {
    const menu = useMemo(() => normalizeData(data), [data])

    const TriggerProps = {
      closeDelay,
      delay,
      openOnHover
    }

    return (
      <Slot
        onOpenChange={() => {
          play('tick')
        }}>
        <MenuPrimitive.Root {...props}>
          <MenuPrimitive.Trigger
            {...TriggerProps}
            nativeButton={false}
            render={render}>
            {children}
          </MenuPrimitive.Trigger>
          <React.Activity>
            {hasValues(menu) && (
              <MenuPrimitive.Portal>
                <MenuPrimitive.Positioner align={align} side={side}>
                  <PopupProvider
                    ItemProps={{
                      closeOnClick
                    }}
                    TriggerProps={TriggerProps}>
                    <Popup menu={menu} />
                  </PopupProvider>
                </MenuPrimitive.Positioner>
              </MenuPrimitive.Portal>
            )}
          </React.Activity>
        </MenuPrimitive.Root>
      </Slot>
    )
  }
)
