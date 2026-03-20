import {useQuery} from '@tanstack/react-query'
import {
  VscodeDivider,
  VscodeIcon,
  VscodeMultiSelect
} from '@vscode-elements/react-elements'
import {
  flow,
  identity,
  intersection,
  mapValues,
  union,
  uniq,
  without,
  xor
} from 'es-toolkit'
import {size} from 'es-toolkit/compat'
import {sort} from 'fast-sort'

import {Popover} from '../../components/popover'
import {QueryBoundary} from '../../components/query-boundary'
import {ToolbarButton} from '../../components/toolbar-button'
import {Tree} from '../../components/tree'
import {EMPTY_ARRAY, ICON_SETS_URL} from '../../constants'
import {component} from '../../hocs'
import {useCallback} from '../../hooks/use-callback'
import {useMemo} from '../../hooks/use-memo'
import {getQueryOptions, has} from '../../utils'
import {pluralize} from '../../utils/pluralize'
import {useInit, useStore} from './hooks'

const queryOptions = getQueryOptions({url: ICON_SETS_URL})

const getIconSetThemes = iconSet =>
  [iconSet.prefixes, iconSet.suffixes].flatMap(Object.values)

const isFiltering = flow(xor, has)

const Filter = {
  Label: component(() => {
    const selectedIconSetPrefixes = useStore().useSelectValue(
      ({draft}) => draft.selectedIconSetPrefixes
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
  MultiSelect: component(() => {
    const store = useStore()

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

    const selectedIconSetPrefixes = store.useSelectValue(
      ({draft}) => draft.selectedIconSetPrefixes
    )

    return (
      <VscodeMultiSelect
        combobox={false}
        onChange={event => {
          store.set(({draft}) => {
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
  Tree: component(() => {
    const query = useQuery({...queryOptions, select: identity})
    const store = useStore()

    const selectedIconSetPrefixes = store.useSelectValue(
      ({draft}) => draft.selectedIconSetPrefixes
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
                author: Object.groupBy(
                  iconSets,
                  iconSet => iconSet.author.name
                ),
                category: Object.groupBy(iconSets, iconSet => iconSet.category),
                grid: Object.groupBy(iconSets, iconSet => iconSet.grid),
                license: Object.groupBy(
                  iconSets,
                  iconSet => iconSet.license.spdx
                ),
                palette: Object.groupBy(iconSets, iconSet =>
                  iconSet.palette ? 'Multiple colors' : 'Monotone'
                ),
                tag: uniq(iconSets.flatMap(iconSet => iconSet.tags)).reduce(
                  (a, b) => {
                    a[b] = Object.groupBy(iconSets, iconSet =>
                      iconSet.tags.includes(b)
                    ).true

                    return a
                  },
                  {}
                ),
                theme: uniq(iconSets.flatMap(getIconSetThemes)).reduce(
                  (a, b) => {
                    a[b] = Object.groupBy(iconSets, iconSet =>
                      getIconSetThemes(iconSet).includes(b)
                    ).true

                    return a
                  },
                  {}
                )
              },
              item =>
                Object.fromEntries(
                  sort(
                    Object.entries(
                      mapValues(item, (iconSets = EMPTY_ARRAY) =>
                        iconSets.map(iconSet => ({prefix: iconSet.prefix}))
                      )
                    )
                  ).asc(([a]) => a)
                )
            )
          )
        ).asc(([, item]) => Object.keys(item).length)
      )
    }, [query.data])

    const toggleIconSetPrefixes = useCallback((checked, prefixes) => {
      store.set(({draft}) => {
        draft.selectedIconSetPrefixes = intersection(
          Object.keys(query.data),
          checked
            ? without(draft.selectedIconSetPrefixes, ...prefixes)
            : union(draft.selectedIconSetPrefixes, prefixes)
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
          data={Object.entries(iconSetGroups).map(([a, b]) => ({
            children: Object.entries(b).map(([label, iconSets]) => {
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
            label: pluralize(size(b), a),
            open: true
          }))}
          hideArrows
          indentGuides='always'
        />
      </>
    )
  })
}

export default component(() => {
  const query = useQuery(queryOptions)

  return (
    <QueryBoundary
      query={query}
      queryOptions={queryOptions}
      render={() => {
        useInit()

        return (
          <Popover
            keepMounted
            open
            popupRender={
              <>
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
              </>
            }
            render={
              <div>
                <Filter.Label />
              </div>
            }
          />
        )
      }}
    />
  )
})
