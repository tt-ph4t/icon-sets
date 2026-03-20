import {useQuery} from '@tanstack/react-query'

import {ICON_SETS_URL} from '../../constants'
import {withImmerAtom} from '../../hocs/with-immer-atom'
import {useEffect} from '../../hooks/use-effect'
import {getQueryOptions} from '../../utils'

export const useStore = withImmerAtom({
  selectedIconSetPrefixes: []
})

export const useInit = () => {
  const store = useStore()

  const query = useQuery(
    getQueryOptions({
      select: Object.keys,
      url: ICON_SETS_URL
    })
  )

  useEffect.Once(() => {
    store.set(({draft}) => {
      draft.selectedIconSetPrefixes = query.data
    })
  })
}
