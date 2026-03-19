import {
  VscodeFormContainer,
  VscodeFormGroup,
  VscodeFormHelper
} from '@vscode-elements/react-elements'
import { VList } from 'virtua'

import { Menu } from '../../components/menu'
import { ToolbarButton } from '../../components/toolbar-button'
import { component } from '../../hocs'
import { withImmerAtom } from '../../hocs/with-immer-atom'
import { useCallback } from '../../hooks/use-callback'
import { has } from '../../utils'

const Item = component(({ id, index, renderItem, useStore }) => {
  const store = useStore()

  const onOpenChange = useCallback(open => {
    store.set(({ draft }) => {
      draft[id] = {
        ...draft[id],
        open
      }
    })
  })

  return renderItem({
    context: {
      CollapsibleProps: store.useSelectValue(
        ({ draft }) => ({
          defaultOpen: !index,
          onOpenChange,
          ...draft[id]
        }),
        { deps: [id, index, onOpenChange] }
      ),
      id,
      index
    }
  })
})

export default Object.assign(
  component(({ ids, menu, useStore, ...props }) => {
    const store = useStore()

    const anyOpen = store.useSelectValue(
      ({ draft }) => ids.some(id => draft[id]?.open),
      { deps: [ids] }
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
                {(id, index) => (
                  <Item
                    id={id}
                    index={index}
                    key={id}
                    useStore={useStore}
                    {...props}
                  />
                )}
              </VList>
            </VscodeFormHelper>
          </VscodeFormGroup>
        </VscodeFormContainer>
        <Menu
          data={[
            {
              label: anyOpen ? 'Collapse All' : 'Expand All',
              onClick: () => {
                store.set(({ draft }) => {
                  for (const id of ids)
                    draft[id] = {
                      ...draft[id],
                      open: !anyOpen
                    }
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
      useStore: withImmerAtom()
    })
  }
)
