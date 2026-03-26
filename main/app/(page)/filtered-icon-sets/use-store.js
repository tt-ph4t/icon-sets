import {useQuery} from '@tanstack/react-query'

import {withImmerAtom} from '../../hocs/with-immer-atom'
import {useEffect} from '../../hooks/use-effect'
import {EMPTY_ARRAY, ICON_SETS_URL} from '../../misc/constants'
import {getQueryOptions} from '../../misc/get-query-options'

const useStore = withImmerAtom({
  selectedIconSetPrefixes: EMPTY_ARRAY
})

export default Object.assign(useStore, {
  useInit: () => {
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
})
