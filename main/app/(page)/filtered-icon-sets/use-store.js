import {useQuery} from '@tanstack/react-query'
import {pick} from 'es-toolkit'

import {withImmerAtom} from '../../hocs/with-immer-atom'
import {useCallback} from '../../hooks/use-callback'
import {DEFAULT_QUERY_OPTIONS, EMPTY_ARRAY} from '../../misc/constants'

const useStore = withImmerAtom({
  selectedIconSetPrefixes: EMPTY_ARRAY
})

export default Object.assign(useStore, {
  useInit: () => {
    const store = useStore()

    const query = useQuery({
      ...DEFAULT_QUERY_OPTIONS,
      select: useCallback(iconSets => {
        store.set(({draft}) => {
          draft.selectedIconSetPrefixes = Object.keys(iconSets)
        })
      })
    })

    return pick(query, ['isSuccess'])
  }
})
