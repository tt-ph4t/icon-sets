import {useHeldKeys, useHotkeyRegistrations} from '@tanstack/react-hotkeys'
import {play} from 'cuelume'
import {sumBy} from 'es-toolkit'

import {Kbd} from '../../components/kbd'
import {useProgress} from '../../components/progress'
import {component} from '../../hocs'
import {useUpdateEffect} from '../../hooks/use-update-effect'
import {hasValues} from '../../misc'

const Sound = component(() => {
  const progress = useProgress()

  const dep = sumBy(
    useHotkeyRegistrations(),
    hotkeyRegistrationView => hotkeyRegistrationView.triggerCount
  )

  useUpdateEffect(() => {
    progress.with(() => {
      play('release')
    })
  }, [dep])
})

const HeldKeys = component(props => {
  const heldKeys = useHeldKeys()

  return hasValues(heldKeys) && <Kbd keys={heldKeys} {...props} />
})

export default (
  <>
    <HeldKeys />
    <Sound />
  </>
)
