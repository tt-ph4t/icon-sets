import {Menu as InternalMenu, mergeProps} from '@base-ui/react'
import {isFalsy, isPlainObject} from '@sindresorhus/is'
import {
  VscodeContextMenuItem,
  VscodeFormContainer,
  VscodeFormGroup
} from '@vscode-elements/react-elements'
import {useControllableValue} from 'ahooks'
import {asyncNoop, identity, omit} from 'es-toolkit'
import {castArray} from 'es-toolkit/compat'
import React from 'react'

import {component} from '../hocs'
import {useMemo} from '../hooks/use-memo'
import {useState} from '../hooks/use-state'
import {getId, hasValues, isWordCharacter} from '../misc'
import {buildContext} from '../misc/build-context'
import {EMPTY_ARRAY, THEME} from '../misc/constants'

const normalizeData = data =>
  Iterator.from(castArray(data))
    .filter(value => isPlainObject(value) || isWordCharacter(value))
    .map(value => {
      if (isWordCharacter(value)) return value

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
  const popupContext = usePopupContext(identity)

  return (
    <InternalMenu.Popup
      render={
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
            <InternalMenu.Group>
              <React.Activity>
                {menu.map((data, index) => {
                  if (isWordCharacter(data))
                    return (
                      <InternalMenu.GroupLabel
                        key={getId(index, data)}
                        render={
                          <VscodeContextMenuItem
                            label={data}
                            selected={false}
                            style={{
                              opacity: 0.5
                            }}
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
                        <Item.Submenu
                          {...popupContext.TriggerProps}
                          render={item}>
                          <Popup menu={menu} />
                        </Item.Submenu>
                      ) : separator ? (
                        Item.Separator
                      ) : (
                        <InternalMenu.Item
                          {...popupContext.ItemProps}
                          render={item}
                        />
                      )}
                    </React.Fragment>
                  )
                })}
              </React.Activity>
            </InternalMenu.Group>
          </VscodeFormGroup>
        </VscodeFormContainer>
      }
    />
  )
})

const Item = Object.assign(
  component(
    ({
      description,
      keybinding = description,
      onMouseEnter = asyncNoop,
      onMouseLeave = asyncNoop,
      ...props
    }) => {
      const [selected, setSelected] = useControllableValue(props, {
        defaultValue: false,
        defaultValuePropName: 'defaultSelected',
        trigger: 'onSelectedChange',
        valuePropName: 'selected'
      })

      return (
        <VscodeContextMenuItem
          {...mergeProps(
            {
              keybinding,
              onMouseEnter: async (...args) => {
                setSelected(true)

                await onMouseEnter(...args)
              },
              onMouseLeave: async (...args) => {
                setSelected(false)

                await onMouseLeave(...args)
              },
              selected
            },
            props
          )}
        />
      )
    }
  ),
  {
    Separator: (
      <InternalMenu.Separator render={<VscodeContextMenuItem separator />} />
    ),
    Submenu: component(({children, onOpenChange = asyncNoop, ...props}) => {
      const [state, setState] = useState(false)

      return (
        <InternalMenu.SubmenuRoot
          onOpenChange={async (...args) => {
            setState(args[0])

            await onOpenChange(...args)
          }}>
          <InternalMenu.SubmenuTrigger {...props} selected={state} />
          <InternalMenu.Portal>
            <InternalMenu.Positioner>{children}</InternalMenu.Positioner>
          </InternalMenu.Portal>
        </InternalMenu.SubmenuRoot>
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
    data = EMPTY_ARRAY,
    delay = 0,
    disabled = false,
    openOnHover = true,
    render,
    side = 'bottom'
  }) => {
    const menu = useMemo(() => normalizeData(data), [data])

    const TriggerProps = {
      closeDelay,
      delay,
      openOnHover
    }

    return (
      <InternalMenu.Root disabled={disabled}>
        <InternalMenu.Trigger
          {...TriggerProps}
          nativeButton={false}
          render={render}>
          {children}
        </InternalMenu.Trigger>
        <React.Activity>
          {hasValues(menu) && (
            <InternalMenu.Portal>
              <InternalMenu.Positioner align={align} side={side}>
                <PopupProvider
                  ItemProps={{
                    closeOnClick
                  }}
                  TriggerProps={TriggerProps}>
                  <Popup menu={menu} />
                </PopupProvider>
              </InternalMenu.Positioner>
            </InternalMenu.Portal>
          )}
        </React.Activity>
      </InternalMenu.Root>
    )
  }
)
