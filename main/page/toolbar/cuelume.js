import {capitalCase} from 'change-case'
import {play, setEnabled, sounds} from 'cuelume'
import {sort} from 'fast-sort'

import {Menu} from '../../components/menu'
import {Slot} from '../../components/slot'
import {ToolbarButton} from '../../components/toolbar-button'
import {component} from '../../hocs'
import {useState} from '../../hooks/use-state'
import {pluralize} from '../../misc/pluralize'

const defaultValue = false

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

setEnabled(defaultValue)

export default component(props => {
  const [state, setState] = useState(defaultValue)

  return (
    <Menu
      data={menu}
      render={
        <Slot
          onChange={event => {
            const {checked} = event.target

            setEnabled(checked)
            setState(checked)
          }}
        />
      }>
      <ToolbarButton
        checked={state}
        icon={state ? 'unmute' : 'mute'}
        toggleable
        {...props}
      />
    </Menu>
  )
})
