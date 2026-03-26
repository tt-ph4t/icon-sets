import {useQueries, useQuery} from '@tanstack/react-query'
import {mapValues} from 'es-toolkit'
import ms from 'ms'

import {DATA_BASE_URL, ICON_SETS_URL} from '../../misc/constants'
import {getQueryOptions} from '../../misc/get-query-options'
import {parseIconName} from '../../misc/parse-icon-name'
import {useCallback} from '../use-callback'
import buildIcon from './build-icon'

export const useIconQueries = (...icons) => {
  const buildIconContextQuery = useQuery(
    getQueryOptions({
      select: useCallback(iconSets =>
        mapValues(iconSets, iconSet => ({
          palette: iconSet.palette,
          setName: iconSet.name
        }))
      ),
      url: ICON_SETS_URL
    })
  )

  return useQueries({
    queries: icons.map(({iconCustomisations, iconId, queryOptions}) => {
      const icon = parseIconName(iconId)

      return getQueryOptions({
        enabled: buildIconContextQuery.isSuccess,
        gcTime: ms('1m'),
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
