import {
  VscodeFormContainer,
  VscodeFormGroup,
  VscodeFormHelper
} from '@vscode-elements/react-elements'
import {VList} from 'virtua'

import {Menu} from '../../components/menu'
import {ToolbarButton} from '../../components/toolbar-button'
import {component} from '../../hocs'
import {withImmerAtom} from '../../hocs/with-immer-atom'
import {useCallback} from '../../hooks/use-callback'
import {useRemount} from '../../hooks/use-remount'
import {hasValues} from '../../misc'
import {EMPTY_ARRAY} from '../../misc/constants'
import {renderSlot} from '../../misc/render-slot'

const Item = component(({id, index, renderItem, useStore}) => {
  const store = useStore()

  const onOpenChange = useCallback(open => {
    store.set(({draft}) => {
      draft[id] = {
        ...draft[id],
        open
      }
    })
  })

  return renderSlot({
    bespoke: renderItem,
    context: {
      CollapsibleProps: store.useSelectValue(
        ({draft}) => ({
          defaultOpen: !index,
          onOpenChange,
          ...draft[id]
        }),
        {deps: [id, index, onOpenChange]}
      ),
      id,
      index
    }
  })
})

export default Object.assign(
  useRemount.with(
    component(({ids, INTERNAL_REMOUNT, menu, useStore, ...props}) => {
      const store = useStore()

      const anyOpen = store.useSelectValue(
        ({draft}) => ids.some(id => draft[id]?.open),
        {deps: [ids]}
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
              INTERNAL_REMOUNT.menu,
              {
                label: `${anyOpen ? 'Collapse' : 'Expand'} all`,
                onClick: () => {
                  store.set(({draft}) => {
                    for (const id of ids)
                      draft[id] = {
                        ...draft[id],
                        open: !anyOpen
                      }
                  })
                }
              },
              ...(hasValues(menu) ? [{separator: true}, ...menu] : EMPTY_ARRAY)
            ]}
            render={<ToolbarButton icon='kebab-vertical' slot='actions' />}
          />
        </>
      )
    })
  ),
  {
    createContext: () => ({
      useStore: withImmerAtom()
    })
  }
)
