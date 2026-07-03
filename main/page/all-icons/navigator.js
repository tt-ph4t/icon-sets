import {useHotkey} from '@tanstack/react-hotkeys'
import {useQuery} from '@tanstack/react-query'
import Cycled from 'cycled'

import {ButtonGroup} from '../../components/button-group'
import {component} from '../../hocs'
import {useCallback} from '../../hooks/use-callback'
import {DEFAULT_QUERY_OPTIONS, EMPTY} from '../../misc/constants'
import {useStore} from './misc'

const cycled = new Cycled(EMPTY.ARRAY)

const queryOptions = {
  ...DEFAULT_QUERY_OPTIONS,
  select: iconSets => {
    if (cycled.length === 0) cycled.push(...Object.keys(iconSets))
  }
}

export default component(() => {
  const store = useStore()

  const selectedIconSetPrefixes = store.useSelectValue(
    ({draft}) => draft.selectedIconSetPrefixes
  )

  const step = useCallback((steps = 0) => {
    if (selectedIconSetPrefixes.length === 1)
      cycled.index = cycled.indexOf(selectedIconSetPrefixes[0]) + steps

    if (selectedIconSetPrefixes.length > 1) cycled.index = 0

    store.set(({draft}) => {
      draft.selectedIconSetPrefixes = [cycled.current()]
    })
  })

  const next = useCallback(() => {
    step(1)
  })

  const previous = useCallback(() => {
    step(-1)
  })

  useHotkey('ArrowRight', next)
  useHotkey('ArrowLeft', previous)

  useQuery(queryOptions)

  return (
    <ButtonGroup
      data={[
        {
          icon: 'chevron-left',
          onClick: previous
        },
        {
          icon: 'chevron-right',
          onClick: next
        }
      ]}
    />
  )
})
