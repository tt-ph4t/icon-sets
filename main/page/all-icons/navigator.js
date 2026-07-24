import {useHotkey} from '@tanstack/react-hotkeys'
import {useQuery} from '@tanstack/react-query'
import Cycled from 'cycled'

import {Button} from '../../components/button'
import {component} from '../../hocs'
import {useCallback} from '../../hooks/use-callback'
import {useIconSetMenuQuery} from '../../hooks/use-icon-set-menu-query'
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

  const {selectedIconSetPrefixes} = store.useSelectValue(
    'selectedIconSetPrefixes'
  )

  const hasSingleSelectedIconSet = selectedIconSetPrefixes.length === 1

  const step = useCallback((steps = 0) => {
    cycled.index = hasSingleSelectedIconSet
      ? cycled.indexOf(selectedIconSetPrefixes[0]) + steps
      : 0

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

  const iconSetMenuQuery = useIconSetMenuQuery(iconSet => ({
    checked:
      hasSingleSelectedIconSet && iconSet.prefix === selectedIconSetPrefixes[0],
    onClick: () => {
      store.set(({draft}) => {
        draft.selectedIconSetPrefixes = [iconSet.prefix]
      })
    }
  }))

  return (
    <Button.Group
      data={[
        {
          icon: 'chevron-left',
          onClick: previous
        },
        {
          icon: 'chevron-right',
          onClick: next
        },
        {
          icon: 'list-selection',
          menu: iconSetMenuQuery.data
        }
      ]}
    />
  )
})
