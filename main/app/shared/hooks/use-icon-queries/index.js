import { stringToIcon } from '@iconify/utils'
import { useQueries, useQuery } from '@tanstack/react-query'
import { mapValues } from 'es-toolkit'

import { getQueryOptions } from '../../utils'
import { useCallback } from '../use-callback'
import buildIcon from './build-icon'

export const useIconQueries = (...icons) => {
  const buildIconContextQuery = useQuery(
    getQueryOptions({
      select: useCallback(iconSets =>
        mapValues(iconSets, iconSet => ({ setName: iconSet.name }))
      ),
      url: import.meta.env.VITE_ICON_SETS_URL
    })
  )

  return useQueries({
    queries: icons.map(({ id, queryOptions }) => {
      const icon = stringToIcon(id)

      return getQueryOptions({
        queryKey: id,
        select: data =>
          buildIcon({
            data,
            id,
            ...icon,
            ...buildIconContextQuery.data[icon.prefix]
          }),
        url: `${import.meta.env.VITE_DATA_BASE_URL}/${icon.prefix}/${
          icon.name
        }.toon`,
        ...queryOptions
      })
    })
  })
}
