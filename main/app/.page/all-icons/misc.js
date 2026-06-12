import {useQuery} from '@tanstack/react-query'
import {flow, xor} from 'es-toolkit'

import {useCallback} from '../../hooks/use-callback'
import {hasValues} from '../../misc'
import {DEFAULT_QUERY_OPTIONS, EMPTY} from '../../misc/constants'
import {withImmerAtom} from '../../misc/with-immer-atom'

export const isFiltered = flow(xor, hasValues)

export const useStore = Object.assign(
  withImmerAtom({
    selectedIconSetPrefixes: EMPTY.ARRAY
  }),
  {
    useInit: () => {
      const store = useStore()

      return useQuery({
        ...DEFAULT_QUERY_OPTIONS,
        select: useCallback(iconSets => {
          store.set(({draft}) => {
            draft.selectedIconSetPrefixes = Object.keys(iconSets)
          })
        })
      })
    }
  }
)
