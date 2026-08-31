import {useFps} from '@reactuses/core'
import React from 'react'

import {Slot} from '../../components/slot'
import {ToolbarButton} from '../../components/toolbar-button'
import {component} from '../../hocs'
import {useSettings} from '../../hooks/use-settings'
import {useUpdate} from '../../hooks/use-update'
import {copy} from '../../misc'

const Fps = component(props => {
  const label = `${React.useDeferredValue(useFps())} fps`
  const update = useUpdate()

  return (
    <Slot
      onClick={() => {
        copy(label)
        update()
      }}>
      <ToolbarButton {...props}>{label}</ToolbarButton>
    </Slot>
  )
})

export default component(props => {
  const {isDev} = useSettings().useSelectValue('isDev')

  return isDev && <Fps {...props} />
})
