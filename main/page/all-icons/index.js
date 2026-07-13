import {useQuery} from '@tanstack/react-query'
import {pick} from 'es-toolkit'

import {IconGrid} from '../../components/icon-grid'
import {component} from '../../hocs'
import {useCallback} from '../../hooks/use-callback'
import {DEFAULT_QUERY_OPTIONS} from '../../misc/constants'
import {getId} from '../../misc/get-id'
import filters from './filters'
import {useStore} from './misc'
import Navigator from './navigator'

const AllIcons = component(() => {
  const {selectedIconSetPrefixes} = useStore().useSelectValue(
    'selectedIconSetPrefixes'
  )

  const query = useQuery({
    ...DEFAULT_QUERY_OPTIONS,
    select: iconSets =>
      Object.values(pick(iconSets, selectedIconSetPrefixes)).flatMap(iconSet =>
        iconSet.icons.map(icon => getId(iconSet.prefix, icon))
      )
  })

  return (
    <IconGrid iconIds={query.data}>
      {filters}
      <Navigator />
    </IconGrid>
  )
})

export default component(() => {
  const store = useStore()

  useQuery({
    ...DEFAULT_QUERY_OPTIONS,
    select: useCallback(iconSets => {
      store.set(({draft}) => {
        draft.selectedIconSetPrefixes = Object.keys(iconSets)
      })
    })
  })

  return <AllIcons />
})
