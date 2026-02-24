import { useQuery } from '@tanstack/react-query'
import { capitalCase } from 'change-case'
import { size } from 'es-toolkit/compat'
import { sort } from 'fast-sort'

import { Collapsible } from '../shared/components/collapsible'
import { IconGrid } from '../shared/components/icon-grid'
import { QueryBoundary } from '../shared/components/query-boundary'
import { ICON_SETS_URL } from '../shared/constants'
import { component } from '../shared/hocs'
import { getId, getQueryOptions, has } from '../shared/utils'
import CollapsibleList from './components/collapsible-list'

const useCollapsibleList = CollapsibleList.createHook()

const queryOptions = getQueryOptions({
  select: iconSets => {
    const map = new Map()

    const mapSet = (a, ...b) => {
      const c = map.get(a)

      has(c) ? c.push(...b) : map.set(a, b)
    }

    for (const iconSet of Object.values(iconSets)) {
      const iconIds = iconSet.icons.map(icon => getId(iconSet.prefix, icon))

      mapSet(`[Author] ${iconSet.author.name}`, ...iconIds)
      mapSet(`[Category] ${iconSet.category}`, ...iconIds)
      mapSet(`[Grid] ${iconSet.grid}`, ...iconIds)
      mapSet(`[License] ${iconSet.license.spdx}`, ...iconIds)

      for (const tag of iconSet.tags) mapSet(`[Tag] ${tag}`, ...iconIds)

      for (const [character, iconName] of Object.entries(iconSet.chars))
        mapSet(`[Character] ${character}`, getId(iconSet.prefix, iconName))

      for (const icon of iconSet.icons)
        mapSet(`[Icon] ${capitalCase(icon)}`, getId(iconSet.prefix, icon))
    }

    return Object.fromEntries(sort([...map.entries()]).asc(([a]) => a))
  },
  url: ICON_SETS_URL
})

export default component(() => {
  const query = useQuery(queryOptions)

  return (
    <QueryBoundary
      query={query}
      queryOptions={queryOptions}
      render={() => (
        <Collapsible description={size(query.data)} heading='icon groups'>
          <CollapsibleList
            ids={Object.keys(query.data)}
            renderItem={({ context }) => {
              const iconIds = query.data[context.id]

              return (
                <Collapsible
                  description={iconIds.length}
                  heading={context.id}
                  {...context.CollapsibleProps}>
                  <div style={{ height: 'var(--sidebar-icon-grid-height)' }}>
                    <IconGrid iconIds={iconIds} />
                  </div>
                </Collapsible>
              )
            }}
            useCollapsibleList={useCollapsibleList}
          />
        </Collapsible>
      )}
    />
  )
})
