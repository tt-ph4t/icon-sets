import {useQueries, useQuery} from '@tanstack/react-query'
import {mapValues, pick} from 'es-toolkit'
import ms from 'ms'

import {DATABASE_URL, DEFAULT_QUERY_OPTIONS} from '../../misc/constants'
import {getQueryOptions} from '../../misc/get-query-options'
import {parseIconName} from '../../misc/parse-icon-name'
import {useCustomizedIcons} from '../use-customized-icons'
import buildIcon from './build-icon'

const contextMapQueryOptions = {
  ...DEFAULT_QUERY_OPTIONS,
  select: iconSets =>
    mapValues(iconSets, iconSet => ({
      palette: iconSet.palette,
      setName: iconSet.name
    }))
}

const defaultQueryOptions = pick(DEFAULT_QUERY_OPTIONS, ['select'])

export const useIconQueries = (...icons) => {
  const contextMapQuery = useQuery(contextMapQueryOptions)

  const iconOptions = useCustomizedIcons().store.useSelectValue(({draft}) => ({
    color: draft.global.color
  }))

  return useQueries({
    queries: icons.map(
      ({iconCustomisations, iconId, queryOptions = defaultQueryOptions}) => {
        const {icon} = parseIconName(iconId)

        return getQueryOptions({
          enabled: contextMapQuery.isSuccess,
          gcTime: ms('1m'),
          queryKey: iconId,
          url: `${DATABASE_URL}/${icon.prefix}/${icon.name}.msgpack`,
          ...queryOptions,
          select: data =>
            queryOptions.select(
              buildIcon(
                {
                  data,
                  id: iconId,
                  ...icon,
                  ...contextMapQuery.data[icon.prefix]
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
