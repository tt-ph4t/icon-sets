import {defaultIconProps, mergeIconData} from '@iconify/utils'
import {useQueries, useQuery} from '@tanstack/react-query'
import {mapValues, pick} from 'es-toolkit'

import {DEFAULT_QUERY_OPTIONS} from '../../misc/constants'
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

  const globalIconCustomisations = useCustomizedIcons
    .useStore()
    .useSelectValue(({draft}) => ({
      color: draft.global.color
    }))

  return useQueries({
    queries: icons.map(
      ({iconCustomisations, iconId, queryOptions = defaultQueryOptions}) => {
        const {icon} = parseIconName(iconId)

        return getQueryOptions.icon(icon.prefix, icon.name, {
          delayMs: 250,
          enabled: contextQuery.isSuccess,
          gcTime: 6000,
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
                  ...globalIconCustomisations
                }
              )
            )
        })
      }
    )
  })
}
