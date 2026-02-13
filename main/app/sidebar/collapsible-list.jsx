import {
  VscodeFormContainer,
  VscodeFormGroup,
  VscodeFormHelper,
  VscodeToolbarButton
} from '@vscode-elements/react-elements'
import { VList } from 'virtua'

import { Menu } from '../shared/components/base-ui/menu'
import { component, withImmerAtom } from '../shared/hocs'
import { useMemo } from '../shared/hooks/use-memo'
import { has } from '../shared/utils'

export default Object.assign(
  component(({ ids, menu, renderItem, useCollapsible }) => {
    const collapsible = useCollapsible()
    const collapsibleMap = collapsible.useSelectValue(({ draft }) => draft.map)

    const collapsibleOpen = useMemo(
      () => Object.values(collapsibleMap).some(({ open }) => open),
      [collapsibleMap]
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
                        onOpenChange: open =>
                          collapsible.set(({ draft }) => {
                            ;(draft.map[id] ??= {}).open = open
                          }),
                        ...collapsibleMap[id]
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
              label: collapsibleOpen ? 'Collapse All' : 'Expand All',
              onClick: () => {
                collapsible.set(({ draft }) => {
                  draft.map = ids.reduce((a, b) => {
                    a[b] = {
                      ...collapsibleMap[b],
                      open: !collapsibleOpen
                    }

                    return a
                  }, {})
                })
              }
            },
            ...(has(menu) ? [{ separator: true }, ...menu] : [])
          ]}
          render={<VscodeToolbarButton icon='kebab-vertical' slot='actions' />}
        />
      </>
    )
  }),
  {
    createUseCollapsible: () => withImmerAtom({ map: {} })
  }
)
