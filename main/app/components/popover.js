import { Popover as popover } from '@base-ui/react/popover'
import {
  VscodeFormContainer,
  VscodeFormGroup
} from '@vscode-elements/react-elements'
import React from 'react'
import { renderSlot } from 'render-slot'

import { CARD_STYLE } from '../constants'
import { component } from '../hocs'
import { useState } from '../hooks/use-state'

const { Popup, Portal, Positioner, Root, Trigger } = popover

export const Popover = Object.assign(
  component(props => (
    <Popover.Primitive
      popupWrapper={children => (
        <VscodeFormContainer style={CARD_STYLE}>
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
          <Portal keepMounted={keepMounted}>
            <Positioner
              align={align}
              render={(props, state) => (
                <Popup
                  render={renderSlot({
                    bespoke: true,
                    context: {
                      context: {
                        props,
                        setOpen: setState,
                        state
                      }
                    },
                    default: popupRender,
                    wrapper: popupWrapper
                  })}
                  {...props}
                />
              )}
              side={side}
            />
          </Portal>
        )

        return (
          <Root
            onOpenChange={open => {
              setState(open)
            }}
            open={state}>
            <Trigger
              closeDelay={closeDelay}
              delay={delay}
              nativeButton={false}
              openOnHover={openOnHover}
              render={render}>
              {children}
            </Trigger>
            {keepMounted ? (
              <React.Activity mode={state ? 'visible' : 'hidden'}>
                {portal}
              </React.Activity>
            ) : (
              portal
            )}
          </Root>
        )
      }
    )
  }
)
