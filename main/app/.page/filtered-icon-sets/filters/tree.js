import {useQuery} from '@tanstack/react-query'
import {VscodeToolbarContainer} from '@vscode-elements/react-elements'
import {intersection, mapValues, union, uniq, without} from 'es-toolkit'
import {size} from 'es-toolkit/compat'
import {sort} from 'fast-sort'
import React from 'react'

import {ToolbarButton} from '../../../components/toolbar-button'
import {Tree} from '../../../components/tree'
import {component} from '../../../hocs'
import {useCallback} from '../../../hooks/use-callback'
import {useRemount} from '../../../hooks/use-remount'
import {DEFAULT_QUERY_OPTIONS, EMPTY_ARRAY} from '../../../misc/constants'
import {pluralize} from '../../../misc/pluralize'
import {isFiltering, useStore} from '../misc'

const queryOptions = {
  ...DEFAULT_QUERY_OPTIONS,
  select: iconSets => ({
    iconSet: {
      groups: Object.fromEntries(
        sort(
          Object.entries(
            mapValues(
              {
                ...mapValues(
                  {
                    author: iconSet => iconSet.author.name,
                    category: iconSet => iconSet.category,
                    grid: iconSet => iconSet.grid,
                    license: iconSet => iconSet.license.spdx,
                    palette: iconSet =>
                      iconSet.palette ? 'Multiple colors' : 'Monotone'
                  },
                  a => Object.groupBy(Object.values(iconSets), a)
                ),
                ...mapValues(
                  {
                    tag: iconSet => iconSet.tags,
                    theme: iconSet =>
                      [iconSet.prefixes, iconSet.suffixes].flatMap(
                        Object.values
                      )
                  },
                  fn =>
                    uniq(Object.values(iconSets).flatMap(fn)).reduce((a, b) => {
                      a[b] = Object.groupBy(Object.values(iconSets), iconSet =>
                        fn(iconSet).includes(b)
                      ).true

                      return a
                    }, {})
                )
              },
              a =>
                Object.fromEntries(
                  sort(
                    Object.entries(
                      mapValues(a, (iconSets = EMPTY_ARRAY) =>
                        iconSets.map(iconSet => ({
                          prefix: iconSet.prefix
                        }))
                      )
                    )
                  ).asc(([a]) => a)
                )
            )
          )
        ).asc(([, a]) => size(a))
      ),
      prefixes: Object.keys(iconSets)
    }
  })
}

export default useRemount.with(
  component(({INTERNAL_REMOUNT}) => {
    const query = useQuery(queryOptions)
    const store = useStore()

    const selectedIconSetPrefixes = store.useSelectValue(
      ({draft}) => draft.selectedIconSetPrefixes
    )

    const isFiltered = isFiltering(
      query.data.iconSet.prefixes,
      selectedIconSetPrefixes
    )

    const toggleIconSetPrefixes = useCallback((checked, prefixes) => {
      store.set(({draft}) => {
        draft.selectedIconSetPrefixes = intersection(
          query.data.iconSet.prefixes,
          checked
            ? without(draft.selectedIconSetPrefixes, ...prefixes)
            : union(draft.selectedIconSetPrefixes, prefixes)
        )
      })
    })

    return (
      <>
        <VscodeToolbarContainer>
          <ToolbarButton
            checked={!isFiltered}
            icon='check-all'
            onChange={() => {
              toggleIconSetPrefixes(!isFiltered, query.data.iconSet.prefixes)
            }}
            toggleable
          />
          <ToolbarButton
            icon={INTERNAL_REMOUNT.icon}
            onClick={INTERNAL_REMOUNT}
          />
        </VscodeToolbarContainer>
        <React.Activity>
          <Tree
            data={Object.entries(query.data.iconSet.groups).map(([a, b]) => {
              const label = pluralize(size(b), a)

              return {
                children: Object.entries(b).map(([label, iconSets]) => {
                  label = `${label} (${iconSets.length})`

                  const iconSetPrefixes = iconSets.map(
                    iconSet => iconSet.prefix
                  )

                  const checked = selectedIconSetPrefixes.some(iconSetPrefix =>
                    iconSetPrefixes.includes(iconSetPrefix)
                  )

                  return {
                    checked,
                    id: label,
                    label,
                    onClick: () => {
                      toggleIconSetPrefixes(checked, iconSetPrefixes)
                    }
                  }
                }),
                id: label,
                label,
                open: true
              }
            })}
          />
        </React.Activity>
      </>
    )
  })
)
