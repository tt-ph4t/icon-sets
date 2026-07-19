import {VscodeCollapsible} from '@vscode-elements/react-elements'
import {useControllableValue, useEventListener} from 'ahooks'
import {play} from 'cuelume'
import {asyncNoop} from 'es-toolkit'

import {component} from '../hocs'
import {useRef} from '../hooks/use-ref'
import {Slot} from './slot'

export const Collapsible = component(
  ({children, onToggle = asyncNoop, ...props}) => {
    const ref = useRef()

    const [open, setOpen] = useControllableValue(props, {
      defaultValue: false,
      defaultValuePropName: 'defaultOpen',
      trigger: 'onOpenChange',
      valuePropName: 'open'
    })

    useEventListener(
      'vsc-collapsible-toggle',
      async (...args) => {
        play('release')
        setOpen(args[0].detail.open) // ?

        await onToggle(...args)
      },
      {
        target: ref
      }
    )

    return (
      <Slot ref={ref}>
        <VscodeCollapsible alwaysShowHeaderActions open={open} {...props}>
          {open && children}
        </VscodeCollapsible>
      </Slot>
    )
  }
)
