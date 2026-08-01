import {useHotkey} from '@tanstack/react-hotkeys'
import {capitalCase} from 'change-case'
import {play, setEnabled, setVolume, sounds} from 'cuelume'
import {range} from 'es-toolkit'
import {sort} from 'fast-sort'

import {Kbd} from '../../components/kbd'
import {Menu} from '../../components/menu'
import {Slot} from '../../components/slot'
import {ToolbarButton} from '../../components/toolbar-button'
import {component} from '../../hocs'
import {useEffect} from '../../hooks/use-effect'
import {pluralize} from '../../misc/pluralize'
import {withImmerAtom} from '../../misc/with-immer-atom'

const soundNames = sort(sounds).asc()
const volumeValues = range(0, 11).map(value => value / 10)
const hotkey = 'm'

const useStore = withImmerAtom({
  enabled: false,
  volume: volumeValues[2]
})

setEnabled(useStore.initial.enabled)
setVolume(useStore.initial.volume)

export default component(props => {
  const store = useStore()
  const state = store.useValue()

  useEffect.update(() => {
    setEnabled(state.enabled)
  }, [state.enabled])

  useEffect.update(() => {
    setVolume(state.volume)
  }, [state.volume])

  useHotkey(hotkey, () => {
    store.toggle('enabled')
  })

  return (
    <Menu
      data={[
        {
          description: Kbd.text(hotkey),
          label: 'Volume',
          menu: volumeValues.map(volume => {
            const checked = volume === state.volume

            return {
              checked,
              disabled: checked && volume === volumeValues[0],
              label: `${volume * 100}%`,
              onClick: () => {
                store.set(({draft}) => {
                  draft.volume = volume
                  draft.enabled = Boolean(volume)
                })
              }
            }
          })
        },
        pluralize(soundNames.length, 'sound'),
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
        icon={state.enabled ? 'unmute' : 'mute'}
        preventToggle
        {...props}
      />
    </Menu>
  )
})
