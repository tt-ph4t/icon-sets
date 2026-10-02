import {
  useIsFetching,
  useIsMutating,
  useIsRestoring
} from '@tanstack/react-query'

export const useIsQueryBusy = (...args) => {
  const isFetching = Boolean(useIsFetching(...args))
  const isMutating = Boolean(useIsMutating(...args))
  const isRestoring = useIsRestoring(...args)

  return isFetching || isMutating || isRestoring
}
