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
    ref: ref1,
    ...props
  }) => {
    const ref2 = useRef()
    const mergedRef = useRef.Merge(ref1, ref2)

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
      {target: ref2}
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
