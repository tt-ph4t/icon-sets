import {VscodeCollapsible} from '@vscode-elements/react-elements'
import {useControllableValue, useEventListener} from 'ahooks'
import {asyncNoop} from 'es-toolkit'
import React from 'react'

import {component} from '../hocs'
import {useRef} from '../hooks/use-ref'

export const Collapsible = component(
  ({
    alwaysShowHeaderActions = true,
    children,
    defaultOpen,
    keepMounted,
    onToggle = asyncNoop,
    ref,
    ...props
  }) => {
    const internalRef = useRef()
    const {mergedRef} = useRef.merge(ref, internalRef)

    const [open, setOpen] = useControllableValue(props, {
      defaultValue: defaultOpen,
      trigger: 'onOpenChange',
      valuePropName: 'open'
    })

    useEventListener(
      'vsc-collapsible-toggle',
      async event => {
        await onToggle(event)

        setOpen(event.detail.open) // ?
      },
      {target: internalRef}
    )

    return (
      <VscodeCollapsible
        alwaysShowHeaderActions={alwaysShowHeaderActions}
        open={open}
        ref={mergedRef}
        {...props}>
        {keepMounted ? (
          <React.Activity mode={open ? 'visible' : 'hidden'}>
            {children}
          </React.Activity>
        ) : (
          open && children
        )}
      </VscodeCollapsible>
    )
  }
)
