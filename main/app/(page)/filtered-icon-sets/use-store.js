import {useQuery} from '@tanstack/react-query'

import {withImmerAtom} from '../../hocs/with-immer-atom'
import {useEffect} from '../../hooks/use-effect'
import {DEFAULT_QUERY_OPTIONS, EMPTY_ARRAY} from '../../misc/constants'

const useStore = withImmerAtom({
  selectedIconSetPrefixes: EMPTY_ARRAY
})

export default Object.assign(useStore, {
  useInit: () => {
    const store = useStore()

    const query = useQuery({
      ...DEFAULT_QUERY_OPTIONS,
      select: Object.keys
    })

    useEffect.Once(() => {
      store.set(({draft}) => {
        draft.selectedIconSetPrefixes = query.data
      })
    })
  }
})
