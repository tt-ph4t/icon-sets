import { useQuery } from '@tanstack/react-query'
import {
  VscodeFormContainer,
  VscodeFormGroup,
  VscodeFormHelper,
  VscodeToolbarButton
} from '@vscode-elements/react-elements'
import { groupBy, mapValues } from 'es-toolkit'
import { sort } from 'fast-sort'
import { VList } from 'virtua'

import { Menu } from '../shared/components/base-ui/menu'
import { Collapsible } from '../shared/components/collapsible'
import { IconGrid } from '../shared/components/icon-grid'
import { QueryBoundary } from '../shared/components/query-boundary'
import { component, withImmerAtom } from '../shared/hocs'
import { useState } from '../shared/hooks'
import { useCallback } from '../shared/hooks/use-callback'
import { getId, getQueryOptions } from '../shared/utils'

const queryOptions = getQueryOptions({
  url: import.meta.env.VITE_ICON_SETS_URL
})

const useCollapsible = withImmerAtom({ map: {} })

const IconSet = component(({ index, prefix }) => {
  const query = useQuery({
    ...queryOptions,
    select: useCallback(iconSets => iconSets[prefix], [prefix])
  })

  const collapsible = useCollapsible()

  const CollapsibleProps = collapsible.useSelectValue(
    ({ draft }) => draft.map[prefix]
  )

  return (
    <Collapsible
      defaultOpen={!index}
      description={query.data.category}
      heading={`${index + 1}. ${query.data.name}`}
      onOpenChange={open =>
        collapsible.set(({ draft }) => {
          ;(draft.map[prefix] ??= {}).open = open
        })
      }
      {...CollapsibleProps}>
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
        const collapsible = useCollapsible()

        const collapsibleMap = collapsible.useSelectValue(
          ({ draft }) => draft.map
        )

        const collapsibleOpen = Object.values(collapsibleMap).some(
          ({ open }) => open
        )

        return (
          <Collapsible
            defaultOpen
            description={prefixes.length}
            heading='icon sets'>
            <VscodeFormContainer>
              <VscodeFormGroup variant='settings-group'>
                <VscodeFormHelper>
                  <VList
                    data={prefixes}
                    style={{
                      height: 'calc(var(--sidebar-icon-grid-height) * 1.5)'
                    }}>
                    {(prefix, index) => (
                      <IconSet index={index} key={prefix} prefix={prefix} />
                    )}
                  </VList>
                </VscodeFormHelper>
              </VscodeFormGroup>
            </VscodeFormContainer>
            <Menu
              data={[
                {
                  label: collapsibleOpen ? 'Collapse All' : 'Expand All',
                  onClick: () => {
                    collapsible.set(({ draft }) => {
                      draft.map = query.data.prefixes.reduce((a, b) => {
                        a[b] = {
                          ...collapsibleMap[b],
                          open: !collapsibleOpen
                        }

                        return a
                      }, {})
                    })
                  }
                },
                { separator: true },
                ...sort(Object.keys(query.data.categories))
                  .asc()
                  .map(category => ({
                    label: category,
                    onClick: () => {
                      setState(state => state === category || category)
                    },
                    selected: category === state
                  }))
              ]}
              render={
                <VscodeToolbarButton icon='kebab-vertical' slot='actions' />
              }
            />
          </Collapsible>
        )
      }}
    />
  )
})
