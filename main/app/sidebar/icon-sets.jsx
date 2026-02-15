import { useQuery } from '@tanstack/react-query'
import { groupBy, mapValues } from 'es-toolkit'
import { sort } from 'fast-sort'

import { Collapsible } from '../shared/components/collapsible'
import { IconGrid } from '../shared/components/icon-grid'
import { QueryBoundary } from '../shared/components/query-boundary'
import { component } from '../shared/hocs'
import { useState } from '../shared/hooks'
import { useCallback } from '../shared/hooks/use-callback'
import { getId, getQueryOptions } from '../shared/utils'
import CollapsibleList from './components/collapsible-list'

const useCollapsibleList = CollapsibleList.createHook()

const queryOptions = getQueryOptions({
  url: import.meta.env.VITE_ICON_SETS_URL
})

const IconSet = component(({ context }) => {
  const query = useQuery({
    ...queryOptions,
    select: useCallback(iconSets => iconSets[context.id], [context.id])
  })

  return (
    <Collapsible
      description={query.data.category}
      heading={`${context.index + 1}. ${query.data.name}`}
      {...context.CollapsibleProps}>
      <div style={{ height: 'var(--sidebar-icon-grid-height)' }}>
        <IconGrid
          iconIds={query.data.icons.map(icon => getId(query.data.prefix, icon))}
        />
      </div>
    </Collapsible>
  )
})

export default component(() => {
  const query = useQuery({
    ...queryOptions,
    select: useCallback(iconSets => ({
      categories: mapValues(
        groupBy(Object.values(iconSets), iconSet => iconSet.category),
        iconSets => iconSets.map(iconSet => iconSet.prefix)
      ),
      prefixes: Object.keys(iconSets)
    }))
  })

  return (
    <QueryBoundary
      query={query}
      queryOptions={queryOptions}
      render={() => {
        const [state, setState] = useState()
        const prefixes = query.data.categories[state] ?? query.data.prefixes

        return (
          <Collapsible
            defaultOpen
            description={prefixes.length}
            heading='icon sets'>
            <CollapsibleList
              ids={prefixes}
              menu={sort(Object.keys(query.data.categories))
                .asc()
                .map(category => ({
                  label: category,
                  onClick: () => {
                    setState(state => state === category || category)
                  },
                  selected: category === state
                }))}
              renderItem={({ context }) => (
                <IconSet context={context} key={context.id} />
              )}
              useCollapsibleList={useCollapsibleList}
            />
          </Collapsible>
        )
      }}
    />
  )
})
