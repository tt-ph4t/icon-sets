import {isNumber, isSafeInteger} from '@sindresorhus/is'
import {useHotkey} from '@tanstack/react-hotkeys'
import {setEnabled, setVolume} from 'cuelume'
import {find, map, pipe} from 'es-toolkit/fp'

import {Kbd} from '../../components/kbd'
import {Slot} from '../../components/slot'
import {ToolbarButton} from '../../components/toolbar-button'
import {component} from '../../hocs'
import {useUpdateEffect} from '../../hooks/use-update-effect'
import {numbers} from '../../misc'
import {withImmerAtom} from '../../misc/with-immer-atom'

const hotkey = 'm'

const useStore = withImmerAtom({
  enabled: false,
  volume: 0.5
})

setEnabled(useStore.initial.enabled)
setVolume(useStore.initial.volume)

export default component(props => {
  const store = useStore()
  const state = store.useValue()
  const volumePercent = Math.round(state.volume * 100)

  useUpdateEffect(() => {
    setEnabled(state.enabled)
  }, [state.enabled])

  useUpdateEffect(() => {
    setVolume(state.volume)
  }, [state.volume])

  useHotkey(hotkey, () => {
    store.toggle('enabled')
  })

  return (
    <Slot
      onClick={() => {
        const volume =
          Math.min(
            100,
            Math.abs(
              pipe(
                numbers(prompt(undefined, `${volumePercent}%`), {
                  splitter: /[\s%]+/u
                }),
                map(Math.round),
                find(isSafeInteger)
              )
            )
          ) / 100

        if (isNumber(volume))
          store.set(({draft}) => {
            draft.volume = volume
            draft.enabled = Boolean(volume)
          })
      }}>
      <ToolbarButton
        checked={state.enabled}
        controlled
        icon={state.enabled ? 'unmute' : 'mute'}
        {...props}>
        {state.enabled ? `${volumePercent}%` : Kbd.text(hotkey)}
      </ToolbarButton>
    </Slot>
  )
})
