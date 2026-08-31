import {isNumber, isSafeInteger} from '@sindresorhus/is'
import {useHotkey} from '@tanstack/react-hotkeys'
import {capitalCase} from 'change-case'
import {play, setEnabled, setVolume, sounds} from 'cuelume'
import {find, map, pipe} from 'es-toolkit/fp'
import {sort} from 'fast-sort'

import {Kbd} from '../../components/kbd'
import {Menu} from '../../components/menu'
import {Slot} from '../../components/slot'
import {ToolbarButton} from '../../components/toolbar-button'
import {component} from '../../hocs'
import {useCallback} from '../../hooks/use-callback'
import {useEffect} from '../../hooks/use-effect'
import {numbers} from '../../misc'
import {pluralize} from '../../misc/pluralize'
import {withImmerAtom} from '../../misc/with-immer-atom'

const soundNames = sort(sounds).asc()
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

  useEffect.update(() => {
    setEnabled(state.enabled)
  }, [state.enabled])

  useEffect.update(() => {
    setVolume(state.volume)
  }, [state.volume])

  const toggleEnabled = useCallback(() => {
    store.toggle('enabled')
  })

  useHotkey(hotkey, toggleEnabled)

  return (
    <Menu
      data={[
        {
          description: `${volumePercent}%`,
          label: 'Set',
          onClick: () => {
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
          }
        },
        {
          checked: state.enabled,
          description: Kbd.text(hotkey),
          disabled: !state.volume,
          label: 'Enabled',
          onClick: toggleEnabled
        },
        pluralize(soundNames, 'sound'),
        ...soundNames.map(sound => ({
          disabled: !state.enabled,
          label: capitalCase(sound),
          onClick: () => {
            play(sound)
          }
        }))
      ]}
      render={
        <Slot
          onChange={event => {
            store.set(({draft}) => {
              draft.enabled = event.target.checked
            })
          }}
        />
      }>
      <ToolbarButton
        checked={state.enabled}
        controlled
        icon={state.enabled ? 'unmute' : 'mute'}
        {...props}
      />
    </Menu>
  )
})
