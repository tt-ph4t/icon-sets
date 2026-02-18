import { mergeProps } from '@base-ui/react/merge-props'
import { VscodeCollapsible } from '@vscode-elements/react-elements'
import { useControllableValue, useEventListener } from 'ahooks'
import { asyncNoop } from 'es-toolkit'
import React from 'react'

import { component } from '../hocs'
import { useRef } from '../hooks/use-ref'

export const Collapsible = component(
  ({
    alwaysShowHeaderActions = true,
    children,
    defaultOpen,
    keepMounted = true,
    onToggle = asyncNoop,
    ...props
  }) => {
    const ref = useRef()

    const [open, setOpen] = useControllableValue(props, {
      defaultValue: defaultOpen,
      trigger: 'onOpenChange',
      valuePropName: 'open'
    })

    useEventListener(
      'vsc-collapsible-toggle',
      async event => {
        await onToggle(event)

        setOpen(event.detail.open)
      },
      { target: ref }
    )

    return (
      <VscodeCollapsible
        {...mergeProps(props, { alwaysShowHeaderActions, open, ref })}>
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
