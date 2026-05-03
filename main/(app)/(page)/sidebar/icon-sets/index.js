import {useQuery} from '@tanstack/react-query'
import {mapValues} from 'es-toolkit'
import {sort} from 'fast-sort'

import {Boundary} from '../../../components/boundary'
import {Collapsible} from '../../../components/collapsible'
import {component} from '../../../hocs'
import {useState} from '../../../hooks/use-state'
import {DEFAULT_QUERY_OPTIONS} from '../../../misc/constants'
import collapsibleList from '../collapsible-list'
import Item from './item'

const CollapsibleList = collapsibleList()

const queryOptions = {
  ...DEFAULT_QUERY_OPTIONS,
  select: iconSets => {
    const categoryList = mapValues(
      Object.groupBy(Object.values(iconSets), iconSet => iconSet.category),
      iconSets =>
        iconSets.map(iconSet => ({
          prefix: iconSet.prefix
        }))
    )

    return {
      iconSet: {
        category: {
          list: categoryList,
          names: sort(Object.keys(categoryList)).asc()
        },
        prefixes: Object.keys(iconSets)
      }
    }
  }
}

export default component(() => {
  const query = useQuery(queryOptions)

  return (
    <Boundary.Query
      query={query}
      render={() => {
        const [state, setState] = useState()

        const iconSetPrefixes =
          query.data.iconSet.category.list[state]?.map(
            iconSet => iconSet.prefix
          ) ?? query.data.iconSet.prefixes

        return (
          <Collapsible
            defaultOpen
            description={iconSetPrefixes.length}
            heading='icon sets'>
            <CollapsibleList
              ids={iconSetPrefixes}
              menu={query.data.iconSet.category.names.map(category => ({
                label: category,
                onClick: () => {
                  setState(state => state === category || category)
                },
                selected: category === state
              }))}
              renderItem={(...[, props]) => <Item {...props} />}
            />
          </Collapsible>
        )
      }}
    />
  )
})
