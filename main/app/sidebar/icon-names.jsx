import { useQuery } from '@tanstack/react-query'
import { noCase } from 'change-case'
import { size } from 'es-toolkit/compat'
import { sort } from 'fast-sort'

import { Collapsible } from '../shared/components/collapsible'
import { IconGrid } from '../shared/components/icon-grid'
import { QueryBoundary } from '../shared/components/query-boundary'
import { ICON_SETS_URL } from '../shared/constants'
import { component } from '../shared/hocs'
import { getId, getQueryOptions } from '../shared/utils'
import CollapsibleList from './components/collapsible-list'

const useCollapsibleList = CollapsibleList.createHook()

const queryOptions = getQueryOptions({
  select: iconSets => {
    const map = new Map() // ?

    for (const iconSet of Object.values(iconSets))
      for (const icon of iconSet.icons)
        map.set(icon, [...(map.get(icon) ?? []), getId(iconSet.prefix, icon)])

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
        <Collapsible description={size(query.data)} heading='icon names'>
          <CollapsibleList
            ids={Object.keys(query.data)}
            renderItem={({ context }) => {
              const iconIds = query.data[context.id]

              return (
                <Collapsible
                  description={iconIds.length}
                  heading={noCase(context.id)}
                  keepMounted={false}
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
