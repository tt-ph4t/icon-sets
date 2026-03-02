import { useQuery } from '@tanstack/react-query'
import {
  VscodeFormContainer,
  VscodeFormGroup,
  VscodeFormHelper
} from '@vscode-elements/react-elements'
import { VList } from 'virtua'

import { IconGrid } from '../shared/components/icon-grid'
import { Menu } from '../shared/components/menu'
import { QueryBoundary } from '../shared/components/query-boundary'
import { ToolbarButton } from '../shared/components/toolbar-button'
import { ICON_SETS_URL } from '../shared/constants'
import { component, withImmerAtom } from '../shared/hocs'
import { useMemo } from '../shared/hooks/use-memo'
import { getQueryOptions, has } from '../shared/utils'

const queryOptions = getQueryOptions({ url: ICON_SETS_URL })

export const IconGridWithFormContainer = component(props => {
  const query = useQuery(queryOptions)

  return (
    <QueryBoundary
      query={query}
      queryOptions={queryOptions}
      render={() => (
        <VscodeFormContainer>
          <VscodeFormGroup variant='settings-group'>
            <VscodeFormHelper
              style={{ height: 'var(--sidebar-icon-grid-height)' }}>
              <IconGrid {...props} />
            </VscodeFormHelper>
          </VscodeFormGroup>
        </VscodeFormContainer>
      )}
    />
  )
})

export const CollapsibleList = Object.assign(
  component(({ ids, menu, renderItem, useCollapsibleList }) => {
    const collapsibleList = useCollapsibleList()

    const collapsibleListCurrent = collapsibleList.useSelectValue(
      ({ draft }) => draft.current,
      { delay: 0 }
    )

    const hasAnyOpen = useMemo(
      () =>
        Object.values(collapsibleListCurrent).some(
          collapsible => collapsible.open
        ),
      [collapsibleListCurrent]
    )

    return (
      <>
        <VscodeFormContainer>
          <VscodeFormGroup variant='settings-group'>
            <VscodeFormHelper>
              <VList
                data={ids}
                style={{
                  height: 'calc(var(--sidebar-icon-grid-height) * 1.5)'
                }}>
                {(id, index) =>
                  renderItem({
                    context: {
                      CollapsibleProps: {
                        defaultOpen: !index,
                        onOpenChange: open => {
                          collapsibleList.set(({ draft }) => {
                            draft.current[id] = {
                              ...draft.current[id],
                              open
                            }
                          })
                        },
                        ...collapsibleListCurrent[id]
                      },
                      id,
                      index
                    }
                  })
                }
              </VList>
            </VscodeFormHelper>
          </VscodeFormGroup>
        </VscodeFormContainer>
        <Menu
          data={[
            {
              label: hasAnyOpen ? 'Collapse All' : 'Expand All',
              onClick: () => {
                collapsibleList.set(({ draft }) => {
                  draft.current = ids.reduce((a, b) => {
                    a[b] = {
                      ...collapsibleListCurrent[b],
                      open: !hasAnyOpen
                    }

                    return a
                  }, {})
                })
              }
            },
            ...(has(menu) ? [{ separator: true }, ...menu] : [])
          ]}
          render={<ToolbarButton icon='kebab-vertical' slot='actions' />}
        />
      </>
    )
  }),
  {
    createHook: () =>
      withImmerAtom({
        current: {}
      })
  }
)
