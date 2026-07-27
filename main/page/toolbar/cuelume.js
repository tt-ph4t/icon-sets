import {capitalCase} from 'change-case'
import {play, setEnabled, sounds} from 'cuelume'
import {sort} from 'fast-sort'
import {useEffect} from 'react'

import {Menu} from '../../components/menu'
import {Slot} from '../../components/slot'
import {ToolbarButton} from '../../components/toolbar-button'
import {component} from '../../hocs'
import {pluralize} from '../../misc/pluralize'
import {withImmerAtom} from '../../misc/with-immer-atom'

const useStore = withImmerAtom({
  enabled: false
})

const menu = [
  pluralize(sounds.length, 'sound'),
  ...sort(sounds)
    .asc()
    .map(sound => ({
      label: capitalCase(sound),
      onClick: () => {
        play(sound)
      }
    }))
]

export default component(props => {
  const store = useStore()
  const state = store.useValue()

  useEffect(() => {
    setEnabled(state.enabled)
  }, [state.enabled])

  return (
    <Menu
      data={menu}
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
        toggleable
        {...props}
      />
    </Menu>
  )
})
