import {useQueries, useQuery} from '@tanstack/react-query'
import {mapValues} from 'es-toolkit'
import ms from 'ms'

import {DATA_BASE_URL, DEFAULT_QUERY_OPTIONS} from '../../misc/constants'
import {getQueryOptions} from '../../misc/get-query-options'
import {parseIconName} from '../../misc/parse-icon-name'
import {useCallback} from '../use-callback'
import buildIcon from './build-icon'

const buildIconContextQueryOptions = {
  ...DEFAULT_QUERY_OPTIONS,
  select: iconSets =>
    mapValues(iconSets, iconSet => ({
      palette: iconSet.palette,
      setName: iconSet.name
    }))
}

export const useIconQueries = (...icons) => {
  const buildIconContextQuery = useQuery(buildIconContextQueryOptions)

  return useQueries({
    queries: icons.map(({iconCustomisations, iconId, queryOptions}) => {
      const icon = parseIconName(iconId)
      const buildIconContext = buildIconContextQuery.data[icon.prefix]

      return getQueryOptions({
        enabled: buildIconContextQuery.isSuccess,
        gcTime: ms('1m'),
        queryKey: iconId,
        select: useCallback(
          data =>
            buildIcon(
              {
                data,
                id: iconId,
                ...icon,
                ...buildIconContext
              },
              iconCustomisations
            ),
          [buildIconContext]
        ),
        url: `${DATA_BASE_URL}/${icon.prefix}/${icon.name}.toon`,
        ...queryOptions
      })
    })
  })
}
