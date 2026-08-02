import {useFps} from '@reactuses/core'

import {Slot} from '../../components/slot'
import {ToolbarButton} from '../../components/toolbar-button'
import {component} from '../../hocs'
import {useSettings} from '../../hooks/use-settings'
import {copy} from '../../misc'

const Fps = component(props => {
  const label = `${useFps()} fps`

  return (
    <Slot
      onClick={() => {
        copy(label)
      }}>
      <ToolbarButton {...props}>{label}</ToolbarButton>
    </Slot>
  )
})

export default component(props => {
  const {isDev} = useSettings().useSelectValue('isDev')

  return isDev && <Fps {...props} />
})
