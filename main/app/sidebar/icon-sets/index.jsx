import { useQuery } from '@tanstack/react-query'
import { groupBy, mapValues } from 'es-toolkit'
import { sort } from 'fast-sort'

import { Collapsible } from '../../shared/components/collapsible'
import { QueryBoundary } from '../../shared/components/query-boundary'
import { ICON_SETS_URL } from '../../shared/constants'
import { component } from '../../shared/hocs'
import { useState } from '../../shared/hooks'
import { useCallback } from '../../shared/hooks/use-callback'
import { getQueryOptions } from '../../shared/utils'
import CollapsibleList from '../components/collapsible-list'
import IconSet from './icon-set'

const useCollapsibleList = CollapsibleList.createHook()

const queryOptions = getQueryOptions({
  url: ICON_SETS_URL
})

export default component(() => {
  const query = useQuery({
    ...queryOptions,
    select: useCallback(iconSets => ({
      categories: mapValues(
        groupBy(Object.values(iconSets), iconSet => iconSet.category),
        iconSets => iconSets.map(iconSet => iconSet.prefix)
      ),
      get categoryNames() {
        return sort(Object.keys(this.categories)).asc()
      },
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
              menu={query.data.categoryNames.map(category => ({
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
