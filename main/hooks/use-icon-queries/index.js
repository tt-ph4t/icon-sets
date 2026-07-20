import {defaultIconProps, mergeIconData} from '@iconify/utils'
import {useQueries, useQuery} from '@tanstack/react-query'
import {mapValues, pick} from 'es-toolkit'
import ms from 'ms'

import {DATABASE_URL, DEFAULT_QUERY_OPTIONS} from '../../misc/constants'
import {getQueryOptions} from '../../misc/get-query-options'
import {parseIconName} from '../../misc/parse-icon-name'
import {useCustomizedIcons} from '../use-customized-icons'
import buildIcon from './build-icon'

const contextQueryOptions = {
  ...DEFAULT_QUERY_OPTIONS,
  select: iconSets =>
    mapValues(iconSets, iconSet => ({
      palette: iconSet.palette,
      setName: iconSet.name
    }))
}

const defaultQueryOptions = pick(DEFAULT_QUERY_OPTIONS, ['select'])

export const useIconQueries = (...icons) => {
  const contextQuery = useQuery(contextQueryOptions)

  const iconOptions = useCustomizedIcons
    .useStore()
    .useSelectValue(({draft}) => ({
      color: draft.global.color
    }))

  return useQueries({
    queries: icons.map(
      ({iconCustomisations, iconId, queryOptions = defaultQueryOptions}) => {
        const {icon} = parseIconName(iconId)

        return getQueryOptions({
          delayMs: ms('.27s'),
          enabled: contextQuery.isSuccess,
          gcTime: ms('6s'),
          queryKey: iconId,
          url: `${DATABASE_URL}/${icon.prefix}/${icon.name}.msgpack`,
          ...queryOptions,
          select: data =>
            queryOptions.select(
              buildIcon(
                {
                  data: mergeIconData(defaultIconProps, data),
                  id: iconId,
                  ...icon,
                  ...contextQuery.data[icon.prefix]
                },
                {
                  ...iconCustomisations,
                  ...iconOptions
                }
              )
            )
        })
      }
    )
  })
}
