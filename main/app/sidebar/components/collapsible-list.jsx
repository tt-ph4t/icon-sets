import {
  VscodeFormContainer,
  VscodeFormGroup,
  VscodeFormHelper,
  VscodeToolbarButton
} from '@vscode-elements/react-elements'
import { VList } from 'virtua'

import { Menu } from '../../shared/components/base-ui/menu'
import { component } from '../../shared/hocs'
import { useMemo } from '../../shared/hooks/use-memo'
import { has } from '../../shared/utils'

export const CollapsibleList = component.withImmerAtom(
  {
    current: {}
  },
  ({ ids, menu, renderItem }) => {
    const collapsibleList = CollapsibleList.useImmerAtom()

    const collapsibleListCurrent = collapsibleList.useSelectValue(
      ({ draft }) => draft.current
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
                        onOpenChange: open =>
                          collapsibleList.set(({ draft }) => {
                            ;(draft.current[id] ??= {}).open = open
                          }),
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
          render={<VscodeToolbarButton icon='kebab-vertical' slot='actions' />}
        />
      </>
    )
  }
)
