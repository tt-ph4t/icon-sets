import {useQuery} from '@tanstack/react-query'
import {noop} from 'es-toolkit'
import {flatMap, pipe} from 'es-toolkit/fp'

import {DEFAULT_QUERY_OPTIONS} from '../misc/constants'
import {useCallback} from './use-callback'

export const useIconSetMenuQuery = (getItemProps = noop) =>
  useQuery({
    ...DEFAULT_QUERY_OPTIONS,
    select: useCallback(
      iconSets => {
        const map = new Map()

        for (const iconSet of Object.values(iconSets)) {
          const label = `${iconSet.name} (${iconSet.icons.length})`

          map.getOrInsert(label.toUpperCase()[0], []).push({
            label,
            ...getItemProps(iconSet)
          })
        }

        return pipe(
          map,
          flatMap(([a, b]) => [a, ...b])
        )
      },
      [getItemProps]
    )
  })
