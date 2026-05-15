import {Popover as InternalPopover} from '@base-ui/react'
import {
  VscodeFormContainer,
  VscodeFormGroup
} from '@vscode-elements/react-elements'
import React from 'react'

import {component} from '../hocs'
import {useState} from '../hooks/use-state'
import {THEME} from '../misc/constants'
import {renderSlot} from '../misc/render-slot'

export const Popover = Object.assign(
  component(props => (
    <Popover.Primitive
      popupWrapper={children => (
        <VscodeFormContainer style={THEME.CARD_STYLE}>
          <VscodeFormGroup
            style={{
              maxHeight: 'calc(var(--available-height) / 1.6)',
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
        open = false,
        openOnHover = true,
        popupRender,
        popupWrapper,
        render,
        side = 'bottom'
      }) => {
        const [state, setState] = useState(open)

        const portal = (
          <React.Activity>
            <InternalPopover.Portal keepMounted={keepMounted}>
              <InternalPopover.Positioner
                align={align}
                render={(props, state) => (
                  <InternalPopover.Popup
                    render={
                      <div>
                        {renderSlot({
                          bespoke: true,
                          context: {
                            props,
                            setOpen: setState,
                            state
                          },
                          default: popupRender,
                          wrapper: popupWrapper
                        })}
                      </div>
                    }
                    {...props}
                  />
                )}
                side={side}
              />
            </InternalPopover.Portal>
          </React.Activity>
        )

        return (
          <InternalPopover.Root
            onOpenChange={open => {
              setState(open)
            }}
            open={state}>
            <InternalPopover.Trigger
              closeDelay={closeDelay}
              delay={delay}
              nativeButton={false}
              openOnHover={openOnHover}
              render={render}>
              {children}
            </InternalPopover.Trigger>
            {keepMounted ? (
              <React.Activity mode={state ? 'visible' : 'hidden'}>
                {portal}
              </React.Activity>
            ) : (
              portal
            )}
          </InternalPopover.Root>
        )
      }
    )
  }
)
