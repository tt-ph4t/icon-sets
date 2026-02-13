import { Popover as popover } from '@base-ui/react/popover'
import {
  VscodeFormContainer,
  VscodeFormGroup
} from '@vscode-elements/react-elements'
import React from 'react'

import { component } from '../../hocs'
import { useState } from '../../hooks'
import { cardStyle, resolveRender } from './utils'

const { Popup, Portal, Positioner, Root, Trigger } = popover

export const Popover = Object.assign(
  component(
    ({
      align = 'start',
      children,
      closeDelay = 0,
      delay = 0,
      keepMounted = false,
      open = false,
      openOnHover = true,
      popupRender,
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
                render={resolveRender(popupRender, {
                  context: {
                    props,
                    setOpen: setState,
                    state
                  }
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
  ),
  {
    Card: component(({ popupRender, ...props }) => (
      <Popover
        popupRender={(...args) => (
          <VscodeFormContainer style={cardStyle}>
            <VscodeFormGroup
              style={{
                maxHeight: 'calc(var(--available-height) / 1.6)',
                maxWidth: 'calc(var(--available-width) / 3)',
                overflow: 'auto'
              }}
              variant='settings-group'>
              {resolveRender(popupRender, ...args)}
            </VscodeFormGroup>
          </VscodeFormContainer>
        )}
        {...props}
      />
    ))
  }
)
