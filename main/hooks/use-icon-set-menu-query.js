import {useQuery} from '@tanstack/react-query'
import {noop} from 'es-toolkit'

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
          const [key] = label.toUpperCase()

          const item = {
            label,
            ...getItemProps(iconSet)
          }

          const group = map.get(key)

          group ? group.push(item) : map.set(key, [item])
        }

        return Iterator.from(map)
          .flatMap(([a, b]) => [a, ...b])
          .toArray()
      },
      [getItemProps]
    )
  })
