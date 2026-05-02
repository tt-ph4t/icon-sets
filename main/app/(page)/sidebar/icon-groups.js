import {useQuery} from '@tanstack/react-query'
import {capitalCase} from 'change-case'
import {mapValues} from 'es-toolkit'
import {castArray, size} from 'es-toolkit/compat'
import {sort} from 'fast-sort'

import {Boundary} from '../../components/boundary'
import {Collapsible} from '../../components/collapsible'
import {IconGrid} from '../../components/icon-grid'
import {component} from '../../hocs'
import {useState} from '../../hooks/use-state'
import {getId} from '../../misc'
import {DEFAULT_QUERY_OPTIONS, ID_SEPARATOR} from '../../misc/constants'
import collapsibleList from './collapsible-list'

const CollapsibleList = collapsibleList()

const groupSelectors = {
  Author: iconSet => iconSet.author.name,
  Category: iconSet => iconSet.category,
  Grid: iconSet => iconSet.grid,
  License: iconSet => iconSet.license.spdx
}

const queryOptions = {
  ...DEFAULT_QUERY_OPTIONS,
  select: iconSets => {
    const data = {}

    const dataSet = (a, b, iconIds) => {
      ;((data[a] ??= {})[b] ??= []).push(...castArray(iconIds))
    }

    for (const iconSet of Object.values(iconSets)) {
      const iconIds = iconSet.icons.map(icon => getId(iconSet.prefix, icon))

      mapValues(groupSelectors, (a, b) => {
        dataSet(b, a(iconSet), iconIds)
      })

      for (const tag of iconSet.tags) dataSet('Tag', tag, iconIds)

      for (const [character, icon] of Object.entries(iconSet.chars))
        dataSet('Character', character, getId(iconSet.prefix, icon))

      for (const icon of iconSet.icons)
        dataSet('Icon', capitalCase(icon), getId(iconSet.prefix, icon))

      for (const [alias, icons] of Object.entries(iconSet.aliases))
        for (const icon of icons)
          dataSet('Alias', capitalCase(alias), getId(iconSet.prefix, icon))
    }

    return {
      CollapsibleListIdsMap: mapValues(data, (a, b) =>
        sort(Object.keys(a))
          .asc()
          .map(a => getId(`[${b}]`, a))
      ),
      groupedIconIds: data
    }
  }
}

export default component(() => {
  const query = useQuery(queryOptions)

  return (
    <Boundary.Query
      query={query}
      render={() => {
        const [state, setState] = useState('Category')

        return (
          <Collapsible
            description={size(query.data.groupedIconIds[state])}
            heading='icon groups'>
            <CollapsibleList
              ids={query.data.CollapsibleListIdsMap[state]}
              menu={sort(Object.keys(query.data.groupedIconIds))
                .asc()
                .map(a => ({
                  label: a,
                  onClick: () => {
                    setState(a)
                  },
                  selected: a === state
                }))}
              renderItem={(...[, {context}]) => {
                const [, heading] = context.id.split(ID_SEPARATOR)
                const iconIds = query.data.groupedIconIds[state][heading]

                return (
                  <Collapsible
                    description={iconIds.length}
                    heading={heading}
                    {...context.CollapsibleProps}>
                    <div style={{height: 'var(--sidebar-icon-grid-height)'}}>
                      <IconGrid iconIds={iconIds} />
                    </div>
                  </Collapsible>
                )
              }}
            />
          </Collapsible>
        )
      }}
    />
  )
})
