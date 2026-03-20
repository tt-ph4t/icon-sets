import {isPlainObject} from '@sindresorhus/is'
import {useQuery} from '@tanstack/react-query'
import {capitalCase} from 'change-case'
import {size} from 'es-toolkit/compat'
import {sort} from 'fast-sort'

import {Collapsible} from '../../components/collapsible'
import {IconGrid} from '../../components/icon-grid'
import {QueryBoundary} from '../../components/query-boundary'
import {ICON_SETS_URL, ID_SEPARATOR} from '../../constants'
import {component} from '../../hocs'
import {useState} from '../../hooks/use-state'
import {getId} from '../../utils'
import {getQueryOptions} from '../../utils/get-query-options'
import CollapsibleList from './collapsible-list'

const CollapsibleListContext = CollapsibleList.createContext()

const queryOptions = getQueryOptions({
  select: iconSets => {
    const map = new Map()

    const mapSet = (a, b, ...iconIds) => {
      let c = map.get(a)

      if (!isPlainObject(c)) map.set(a, (c = {}))
      ;(c[b] ??= []).push(...iconIds)
    }

    for (const iconSet of Object.values(iconSets)) {
      const iconIds = iconSet.icons.map(icon => getId(iconSet.prefix, icon))

      mapSet('Author', iconSet.author.name, ...iconIds)
      mapSet('Category', iconSet.category, ...iconIds)
      mapSet('Grid', iconSet.grid, ...iconIds)
      mapSet('License', iconSet.license.spdx, ...iconIds)

      for (const tag of iconSet.tags) mapSet('Tag', tag, ...iconIds)

      for (const [character, icon] of Object.entries(iconSet.chars))
        mapSet('Character', character, getId(iconSet.prefix, icon))

      for (const icon of iconSet.icons)
        mapSet('Icon', capitalCase(icon), getId(iconSet.prefix, icon))

      for (const [alias, icons] of Object.entries(iconSet.aliases))
        for (const icon of icons)
          mapSet('Alias', capitalCase(alias), getId(iconSet.prefix, icon))
    }

    return Object.fromEntries(map)
  },
  url: ICON_SETS_URL
})

export default component(() => {
  const query = useQuery(queryOptions)

  return (
    <QueryBoundary
      query={query}
      queryOptions={queryOptions}
      render={() => {
        const [state, setState] = useState('Category')

        return (
          <Collapsible
            description={size(query.data[state])}
            heading='icon groups'>
            <CollapsibleList
              ids={sort(Object.keys(query.data[state]))
                .asc()
                .map(a => getId(`[${state}]`, a))}
              menu={sort(Object.keys(query.data))
                .asc()
                .map(a => ({
                  label: a,
                  onClick: () => {
                    setState(a)
                  },
                  selected: a === state
                }))}
              renderItem={({context}) => {
                const [, heading] = context.id.split(ID_SEPARATOR)
                const iconIds = query.data[state][heading]

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
              {...CollapsibleListContext}
            />
          </Collapsible>
        )
      }}
    />
  )
})
