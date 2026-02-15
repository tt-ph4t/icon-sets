import { useQuery } from '@tanstack/react-query'
import { size } from 'es-toolkit/compat'
import { sort } from 'fast-sort'

import { Collapsible } from '../shared/components/collapsible'
import { IconGrid } from '../shared/components/icon-grid'
import { QueryBoundary } from '../shared/components/query-boundary'
import { component } from '../shared/hocs'
import { getId, getQueryOptions } from '../shared/utils'
import CollapsibleList from './components/collapsible-list'

const useCollapsibleList = CollapsibleList.createHook()

const queryOptions = getQueryOptions({
  select: iconSets => {
    const iconIds = {}

    for (const iconSet of Object.values(iconSets))
      for (const [char, iconName] of Object.entries(iconSet.chars))
        iconIds[char] = [
          ...(iconIds[char] ?? []),
          getId(iconSet.prefix, iconName)
        ]

    return Object.fromEntries(sort(Object.entries(iconIds)).asc(([a]) => a))
  },
  url: import.meta.env.VITE_ICON_SETS_URL
})

export default component(() => {
  const query = useQuery(queryOptions)

  return (
    <QueryBoundary
      query={query}
      queryOptions={queryOptions}
      render={() => (
        <Collapsible description={size(query.data)} heading='characters'>
          <CollapsibleList
            ids={Object.keys(query.data)}
            renderItem={({ context }) => {
              const iconIds = query.data[context.id]

              return (
                <Collapsible
                  description={iconIds.length}
                  heading={context.id}
                  keepMounted={false}
                  useCollapsibleList={useCollapsibleList}
                  {...context.CollapsibleProps}>
                  <div style={{ height: 'var(--sidebar-icon-grid-height)' }}>
                    <IconGrid iconIds={iconIds} />
                  </div>
                </Collapsible>
              )
            }}
          />
        </Collapsible>
      )}
    />
  )
})
