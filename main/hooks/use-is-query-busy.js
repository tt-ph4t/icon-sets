import {
  useIsFetching,
  useIsMutating,
  useIsRestoring
} from '@tanstack/react-query'

export const useIsQueryBusy = (filters, queryClient) => {
  const isFetching = useIsFetching(filters, queryClient)
  const isMutating = useIsMutating(filters, queryClient)
  const isRestoring = useIsRestoring()

  return Boolean(isFetching || isMutating || isRestoring)
}
