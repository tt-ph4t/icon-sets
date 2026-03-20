import {useQuery} from '@tanstack/react-query'
import {mapValues} from 'es-toolkit'
import {sort} from 'fast-sort'

import {Collapsible} from '../../../components/collapsible'
import {QueryBoundary} from '../../../components/query-boundary'
import {ICON_SETS_URL} from '../../../constants'
import {component} from '../../../hocs'
import {useState} from '../../../hooks/use-state'
import {getQueryOptions} from '../../../utils'
import CollapsibleList from '../collapsible-list'
import IconSet from './icon-set'

const CollapsibleListContext = CollapsibleList.createContext()

const queryOptions = getQueryOptions({
  select: iconSets => ({
    categories: mapValues(
      Object.groupBy(Object.values(iconSets), iconSet => iconSet.category),
      iconSets => iconSets.map(iconSet => iconSet.prefix)
    ),
    get categoryNames() {
      return sort(Object.keys(this.categories)).asc()
    },
    prefixes: Object.keys(iconSets)
  }),
  url: ICON_SETS_URL
})

export default component(() => {
  const query = useQuery(queryOptions)

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
              renderItem={props => <IconSet {...props} />}
              {...CollapsibleListContext}
            />
          </Collapsible>
        )
      }}
    />
  )
})
