import {Popover as PopoverPrimitive} from '@base-ui/react'
import {
  VscodeFormContainer,
  VscodeFormGroup
} from '@vscode-elements/react-elements'
import {asyncNoop} from 'es-toolkit'
import React from 'react'

import {component} from '../hocs'
import {useState} from '../hooks/use-state'
import {THEME} from '../misc/constants'
import {Slot} from './slot'

export const Popover = Object.assign(
  component(props => (
    <Popover.Primitive
      popupWrapper={children => (
        <VscodeFormContainer style={THEME.CARD_STYLE}>
          <VscodeFormGroup
            style={{
              maxHeight: 'calc(var(--available-height) / 1.4)',
              maxWidth: 'calc(var(--available-width) / 3)',
              overflow: 'auto'
            }}
            variant='settings-group'>
            {children}
          </VscodeFormGroup>
        </VscodeFormContainer>
      )}
      {...props}
    />
  )),
  {
    Primitive: component(
      ({
        align = 'start',
        children,
        closeDelay = 0,
        delay = 0,
        keepMounted = false,
        onOpenChange = asyncNoop,
        open = false,
        openOnHover = true,
        popupRender,
        popupWrapper,
        render,
        side = 'bottom'
      }) => {
        const [state, setState] = useState(open)

        const portal = (
          <PopoverPrimitive.Portal keepMounted={keepMounted}>
            <PopoverPrimitive.Positioner
              align={align}
              render={(props, state) => (
                <PopoverPrimitive.Popup
                  render={
                    <div {...props}>
                      {Slot.render({
                        bespoke: popupRender,
                        context: {
                          props,
                          setOpen: setState,
                          state
                        },
                        wrapper: popupWrapper
                      })}
                    </div>
                  }
                />
              )}
              side={side}
            />
          </PopoverPrimitive.Portal>
        )

        return (
          <PopoverPrimitive.Root
            onOpenChange={async (...args) => {
              setState(args[0])

              await onOpenChange(...args)
            }}
            open={state}>
            <PopoverPrimitive.Trigger
              closeDelay={closeDelay}
              delay={delay}
              nativeButton={false}
              openOnHover={openOnHover}
              render={render}>
              {children}
            </PopoverPrimitive.Trigger>
            {keepMounted ? (
              <React.Activity mode={state ? 'visible' : 'hidden'}>
                {portal}
              </React.Activity>
            ) : (
              portal
            )}
          </PopoverPrimitive.Root>
        )
      }
    )
  }
)
