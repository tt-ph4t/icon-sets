import { stringToIcon } from '@iconify/utils'
import { useQueries, useQuery } from '@tanstack/react-query'
import { mapValues } from 'es-toolkit'

import { DATA_BASE_URL, ICON_SETS_URL } from '../../constants'
import { getQueryOptions } from '../../utils'
import { useCallback } from '../use-callback'
import buildIcon from './build-icon'

export const useIconQueries = (...icons) => {
  const buildIconContextQuery = useQuery(
    getQueryOptions({
      select: useCallback(iconSets =>
        mapValues(iconSets, iconSet => ({ setName: iconSet.name }))
      ),
      url: ICON_SETS_URL
    })
  )

  return useQueries({
    queries: icons.map(({ iconCustomisations, iconId, queryOptions }) => {
      const icon = stringToIcon(iconId)

      return getQueryOptions({
        queryKey: iconId,
        select: data =>
          buildIcon(
            {
              data,
              id: iconId,
              ...icon,
              ...buildIconContextQuery.data[icon.prefix]
            },
            iconCustomisations
          ),
        url: `${DATA_BASE_URL}/${icon.prefix}/${icon.name}.toon`,
        ...queryOptions
      })
    })
  })
}
