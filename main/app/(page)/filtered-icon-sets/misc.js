import {useQuery} from '@tanstack/react-query'
import {flow, xor} from 'es-toolkit'

import {withImmerAtom} from '../../hocs/with-immer-atom'
import {useCallback} from '../../hooks/use-callback'
import {hasValues} from '../../misc'
import {DEFAULT_QUERY_OPTIONS, EMPTY_ARRAY} from '../../misc/constants'

export const isFiltering = flow(xor, hasValues)

const internalUseStore = withImmerAtom({
  selectedIconSetPrefixes: EMPTY_ARRAY
})

export const useStore = Object.assign(internalUseStore, {
  useInit: () => {
    const store = internalUseStore()

    return useQuery({
      ...DEFAULT_QUERY_OPTIONS,
      select: useCallback(iconSets => {
        store.set(({draft}) => {
          draft.selectedIconSetPrefixes = Object.keys(iconSets)
        })
      })
    })
  }
})
