import {Menu as MenuPrimitive} from '@base-ui/react'
import {isFalsy, isPlainObject} from '@sindresorhus/is'
import {castArray} from 'es-toolkit/compat'
import {filter, map, pipe} from 'es-toolkit/fp'

import {component} from '../../hocs'
import {useMemo} from '../../hooks/use-memo'
import {hasValues} from '../../misc'
import {EMPTY} from '../../misc/constants'
import {Context, ContextSlot, isGroupLabel} from './misc'
import popup from './popup'

const normalizeData = data =>
  pipe(
    castArray(data),
    filter(value => isPlainObject(value) || isGroupLabel(value)),
    map(value => {
      if (isGroupLabel(value)) return value

      const {menu, ...data} = value

      if (isFalsy(data.selected)) delete data.selected

      return {
        menu: normalizeData(menu),
        ...data
      }
    })
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
      <Context
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
          {hasValues(menu) && (
            <MenuPrimitive.Portal>
              <MenuPrimitive.Positioner align={align} side={side}>
                {popup(menu)}
              </MenuPrimitive.Positioner>
            </MenuPrimitive.Portal>
          )}
        </ContextSlot>
      </Context>
    )
  }
)
