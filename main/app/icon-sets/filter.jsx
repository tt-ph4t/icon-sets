import { useQuery } from '@tanstack/react-query'
import {
  VscodeDivider,
  VscodeIcon,
  VscodeMultiSelect
} from '@vscode-elements/react-elements'
import { capitalCase } from 'change-case'
import {
  flow,
  groupBy,
  identity,
  intersection,
  mapValues,
  pick,
  union,
  uniq,
  without,
  xor
} from 'es-toolkit'
import { sort } from 'fast-sort'

import { Popover } from '../shared/components/base-ui/popover'
import { QueryBoundary } from '../shared/components/query-boundary'
import { ToolbarButton } from '../shared/components/toolbar-button'
import { Tree } from '../shared/components/tree'
import { component, withImmerAtom } from '../shared/hocs'
import { useCallback } from '../shared/hooks/use-callback'
import { useEffect } from '../shared/hooks/use-effect'
import { useMemo } from '../shared/hooks/use-memo'
import { useRef } from '../shared/hooks/use-ref'
import { getQueryOptions, has } from '../shared/utils'
import { timeAgo } from '../shared/utils/time-ago'

const queryOptions = getQueryOptions({
  url: import.meta.env.VITE_ICON_SETS_URL
})

const getIconSetThemes = iconSet =>
  [iconSet.prefixes, iconSet.suffixes].flatMap(Object.values)

const isFiltering = flow(xor, has)

const Filter = {
  MultiSelect: component(() => {
    const filter = useFilter()

    const query = useQuery({
      ...queryOptions,
      select: useCallback(iconSets => ({
        iconSetPrefixIndexMap: Object.keys(iconSets).reduce((a, b, index) => {
          a[b] = index

          return a
        }, {}),
        VscodeMultiSelectProps: {
          options: Object.values(iconSets).map(iconSet => ({
            get description() {
              return this.value
            },
            label: iconSet.name,
            value: iconSet.prefix
          }))
        }
      }))
    })

    const selectedIconSetPrefixes = filter.useSelectValue(
      ({ draft }) => draft.selectedIconSetPrefixes
    )

    return (
      <VscodeMultiSelect
        combobox={false}
        onChange={event => {
          filter.set(({ draft }) => {
            draft.selectedIconSetPrefixes = intersection(
              Object.keys(query.data.iconSetPrefixIndexMap),
              event.target.value
            )
          })
        }}
        selectedIndexes={selectedIconSetPrefixes.map(
          iconSetPrefix => query.data.iconSetPrefixIndexMap[iconSetPrefix]
        )}
        {...query.data.VscodeMultiSelectProps}
      />
    )
  }),
  ToolbarButton: component(() => {
    const selectedIconSetPrefixes = useFilter().useSelectValue(
      ({ draft }) => draft.selectedIconSetPrefixes
    )

    const query = useQuery({
      ...queryOptions,
      select: useCallback(
        iconSets => isFiltering(Object.keys(iconSets), selectedIconSetPrefixes),
        [selectedIconSetPrefixes]
      )
    })

    return (
      <ToolbarButton checked={query.data} icon='filter' preventToggle>
        Filter
      </ToolbarButton>
    )
  }),
  Tree: component(() => {
    const query = useQuery({ ...queryOptions, select: identity })
    const filter = useFilter()

    const selectedIconSetPrefixes = filter.useSelectValue(
      ({ draft }) => draft.selectedIconSetPrefixes
    )

    const isFiltered = isFiltering(
      Object.keys(query.data),
      selectedIconSetPrefixes
    )

    const iconSetGroups = useMemo(() => {
      const iconSets = Object.values(query.data)

      return Object.fromEntries(
        sort(
          Object.entries(
            mapValues(
              {
                author: groupBy(iconSets, iconSet => iconSet.author.name),
                categories: uniq(
                  iconSets.flatMap(iconSet => Object.keys(iconSet.categories))
                ).reduce((a, b) => {
                  a[b] = groupBy(iconSets, iconSet =>
                    Object.keys(iconSet.categories).includes(b)
                  ).true

                  return a
                }, {}),
                category: groupBy(iconSets, iconSet => iconSet.category),
                grid: groupBy(iconSets, iconSet => iconSet.grid),
                lastModified: uniq(
                  sort(iconSets.map(iconSet => iconSet.lastModified))
                    .desc()
                    .map(timeAgo.unix)
                ).reduce((a, b) => {
                  a[b] = groupBy(
                    iconSets,
                    iconSet => timeAgo.unix(iconSet.lastModified) === b
                  ).true

                  return a
                }, {}),
                license: groupBy(iconSets, iconSet => iconSet.license.spdx),
                palette: groupBy(iconSets, iconSet =>
                  iconSet.palette ? 'Multiple colors' : 'Monotone'
                ),
                tags: uniq(iconSets.flatMap(iconSet => iconSet.tags)).reduce(
                  (a, b) => {
                    a[b] = groupBy(iconSets, iconSet =>
                      iconSet.tags.includes(b)
                    ).true

                    return a
                  },
                  {}
                ),
                themes: uniq(iconSets.flatMap(getIconSetThemes)).reduce(
                  (a, b) => {
                    a[b] = groupBy(iconSets, iconSet =>
                      getIconSetThemes(iconSet).includes(b)
                    ).true

                    return a
                  },
                  {}
                )
              },
              item =>
                mapValues(item, (iconSets = []) =>
                  iconSets.map(iconSet => pick(iconSet, ['prefix']))
                )
            )
          )
        ).asc(([, item]) => Object.keys(item).length)
      )
    }, [query.data])

    const iconSetPrefixesByGroup = useMemo(
      () =>
        mapValues(iconSetGroups, item =>
          uniq(
            Object.values(item).flatMap(iconSets =>
              iconSets.map(iconSet => iconSet.prefix)
            )
          )
        ),
      [iconSetGroups]
    )

    const toggleIconSetPrefixes = useCallback((checked, iconSetPrefixes) => {
      filter.set(({ draft }) => {
        draft.selectedIconSetPrefixes = intersection(
          Object.keys(query.data),
          checked
            ? without(draft.selectedIconSetPrefixes, ...iconSetPrefixes)
            : union(draft.selectedIconSetPrefixes, iconSetPrefixes)
        )
      })
    })

    return (
      <>
        <ToolbarButton
          checked={!isFiltered}
          onChange={() => {
            toggleIconSetPrefixes(!isFiltered, Object.keys(query.data))
          }}
          toggleable>
          All
        </ToolbarButton>
        <Tree
          data={Object.entries(iconSetGroups).map(([a, b]) => {
            // const iconSetPrefixes = iconSetPrefixesByGroup[a]

            // const checked = selectedIconSetPrefixes.some(a =>
            //   iconSetPrefixes.includes(a)
            // )

            return {
              children: (['lastModified'].includes(a)
                ? Object.entries(b)
                : sort(Object.entries(b)).asc(([label]) => label)
              ).map(([label, iconSets]) => {
                const iconSetPrefixes = iconSets.map(iconSet => iconSet.prefix)

                const checked = selectedIconSetPrefixes.some(a =>
                  iconSetPrefixes.includes(a)
                )

                return {
                  id: label,
                  label: (
                    <>
                      {`${label} (${iconSets.length})`}
                      <VscodeIcon
                        name={checked ? 'check' : 'blank'}
                        slot='icon-leaf'
                      />
                    </>
                  ),
                  onClick: () => {
                    toggleIconSetPrefixes(checked, iconSetPrefixes)
                  }
                }
              }),
              id: a,
              label: capitalCase(a),
              open: true
            }
          })}
          hideArrows
          indentGuides='always'
        />
      </>
    )
  })
}

export const useFilter = Object.assign(
  withImmerAtom({
    selectedIconSetPrefixes: []
  }),
  {
    useInit: () => {
      const ref = useRef(true)
      const query = useQuery({ ...queryOptions, select: Object.keys })
      const filter = useFilter()

      useEffect(() => {
        if (ref.current)
          filter.set(({ draft }) => {
            draft.selectedIconSetPrefixes = query.data
          })

        return () => {
          ref.current = false
        }
      }, [])
    }
  }
)

export default component(() => {
  const query = useQuery(queryOptions)

  return (
    <QueryBoundary
      query={query}
      queryOptions={queryOptions}
      render={() => {
        useFilter.useInit()

        return (
          <Popover.Card
            keepMounted
            open
            popupRender={
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    inset: 0,
                    position: 'sticky',
                    zIndex: 1
                  }}>
                  <Filter.MultiSelect />
                  <VscodeDivider />
                </div>
                <Filter.Tree />
              </div>
            }
            render={
              <div>
                <Filter.ToolbarButton />
              </div>
            }
          />
        )
      }}
    />
  )
})
