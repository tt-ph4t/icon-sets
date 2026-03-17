import {
  VscodeFormContainer,
  VscodeFormGroup,
  VscodeFormHelper
} from '@vscode-elements/react-elements'
import React from 'react'
import { VList } from 'virtua'

import { Menu } from '../../components/menu'
import { ToolbarButton } from '../../components/toolbar-button'
import { component } from '../../hocs'
import { withImmerAtom } from '../../hocs/with-immer-atom'
import { useMemo } from '../../hooks/use-memo'
import { has } from '../../utils'

export default Object.assign(
  component(({ ids, menu, renderItem, useStore }) => {
    const store = useStore()

    const storeCurrent = store.useSelectValue(({ draft }) => draft.current, {
      delay: 0
    })

    const hasAnyOpen = useMemo(
      () =>
        Object.values(storeCurrent).some(
          CollapsibleProps => CollapsibleProps.open
        ),
      [storeCurrent]
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
                {(id, index) => {
                  const context = {
                    CollapsibleProps: {
                      defaultOpen: !index,
                      onOpenChange: open => {
                        store.set(({ draft }) => {
                          draft.current[id] = {
                            ...draft.current[id],
                            open
                          }
                        })
                      },
                      ...storeCurrent[id]
                    },
                    id,
                    index
                  }

                  return React.cloneElement(renderItem({ context }), {
                    key: context.id
                  })
                }}
              </VList>
            </VscodeFormHelper>
          </VscodeFormGroup>
        </VscodeFormContainer>
        <Menu
          data={[
            {
              label: hasAnyOpen ? 'Collapse All' : 'Expand All',
              onClick: () => {
                store.set(({ draft }) => {
                  draft.current = ids.reduce((a, b) => {
                    a[b] = {
                      ...storeCurrent[b],
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
    createContext: () => ({
      useStore: withImmerAtom({
        current: {}
      })
    })
  }
)
