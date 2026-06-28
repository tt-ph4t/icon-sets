import {
  useIsFetching,
  useIsMutating,
  useIsRestoring
} from '@tanstack/react-query'

import {QUERY_CLIENT} from '../misc/constants'

export const useIsQueryBusy = (filters, queryClient = QUERY_CLIENT.GLOBAL) => {
  const isFetching = useIsFetching(filters, queryClient)
  const isMutating = useIsMutating(filters, queryClient)
  const isRestoring = useIsRestoring()

  return isFetching || isMutating || isRestoring
}
