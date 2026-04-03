import {useQuery} from '@tanstack/react-query'
import {VscodeDivider, VscodeMultiSelect} from '@vscode-elements/react-elements'
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
import {ToolbarButton} from '../../components/toolbar-button'
import {Tree} from '../../components/tree'
import {component} from '../../hocs'
import {useCallback} from '../../hooks/use-callback'
import {useMemo} from '../../hooks/use-memo'
import {hasValues} from '../../misc'
import {DEFAULT_QUERY_OPTIONS, EMPTY_ARRAY} from '../../misc/constants'
import {pluralize} from '../../misc/pluralize'
import useStore from './use-store'

const getIconSetThemes = iconSet =>
  [iconSet.prefixes, iconSet.suffixes].flatMap(Object.values)

const isFiltering = flow(xor, hasValues)

const Filter = {
  Label: component(() => {
    const selectedIconSetPrefixes = useStore().useSelectValue(
      ({draft}) => draft.selectedIconSetPrefixes
    )

    const query = useQuery({
      ...DEFAULT_QUERY_OPTIONS,
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
      ...DEFAULT_QUERY_OPTIONS,
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
    const query = useQuery({...DEFAULT_QUERY_OPTIONS, select: identity})
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
          data={Object.entries(iconSetGroups).map(([a, b]) => {
            const label = pluralize(size(b), a)

            return {
              children: Object.entries(b).map(([label, iconSets]) => {
                label = `${label} (${iconSets.length})`

                const iconSetPrefixes = iconSets.map(iconSet => iconSet.prefix)

                const checked = selectedIconSetPrefixes.some(a =>
                  iconSetPrefixes.includes(a)
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
          hideArrows
          indentGuides='always'
        />
      </>
    )
  })
}

export default component(() => (
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
))
