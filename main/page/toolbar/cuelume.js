import {capitalCase} from 'change-case'
import {play, setEnabled, setVolume, sounds} from 'cuelume'
import {range} from 'es-toolkit'
import {sort} from 'fast-sort'

import {Menu} from '../../components/menu'
import {Slot} from '../../components/slot'
import {ToolbarButton} from '../../components/toolbar-button'
import {component} from '../../hocs'
import {useEffect} from '../../hooks/use-effect'
import {pluralize} from '../../misc/pluralize'
import {withImmerAtom} from '../../misc/with-immer-atom'

const soundNames = sort(sounds).asc()
const volumeValues = range(0, 11).map(value => value / 10)

const useStore = withImmerAtom({
  enabled: false,
  volume: volumeValues[2]
})

export default component(props => {
  const store = useStore()
  const state = store.useValue()

  useEffect(() => {
    setEnabled(state.enabled)
  }, [state.enabled])

  useEffect(() => {
    setVolume(state.volume)
  }, [state.volume])

  return (
    <Menu
      data={[
        {
          label: 'Volume',
          menu: volumeValues.map(volume => ({
            checked: volume === state.volume,
            label: `${volume * 100}%`,
            onClick: () => {
              store.set(({draft}) => {
                draft.volume = volume
                draft.enabled = Boolean(volume)
              })
            }
          }))
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
