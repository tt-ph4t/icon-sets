import {
  VscodeFormContainer,
  VscodeFormGroup,
  VscodeFormHelper
} from '@vscode-elements/react-elements'
import {mapValues, partition} from 'es-toolkit'
import {VList} from 'virtua'

import {Menu} from '../../components/menu'
import {ToolbarButton} from '../../components/toolbar-button'
import {component} from '../../hocs'
import {withImmerAtom} from '../../hocs/with-immer-atom'
import {useMemo} from '../../hooks/use-memo'
import {useRemount} from '../../hooks/use-remount'
import {hasValues} from '../../misc'
import {EMPTY_ARRAY, EMPTY_OBJECT} from '../../misc/constants'
import {pluralize} from '../../misc/pluralize'
import {renderSlot} from '../../misc/render-slot'

export default () => {
  const useStore = withImmerAtom(EMPTY_OBJECT)

  const Item = component(({id, index, renderItem}) => {
    const store = useStore()

    const CollapsibleProps = store.useSelectValue(
      ({draft}) => ({
        defaultOpen: !index,
        onOpenChange: open => {
          store.set(({draft}) => {
            draft[id] = {
              ...draft[id],
              open
            }
          })
        },
        ...draft[id]
      }),
      {
        deps: [id, index, store]
      }
    )

    return renderSlot({
      bespoke: renderItem,
      context: {
        CollapsibleProps,
        id,
        index
      }
    })
  })

  return useRemount.with(
    component(({ids, INTERNAL_REMOUNT, menu, ...props}) => {
      const store = useStore()

      const openMap = store.useSelectValue(({draft}) =>
        mapValues(draft, props => props.open)
      )

      const [openedIds, closedIds] = useMemo(
        () => partition(ids, id => openMap[id]),
        [ids, openMap]
      )

      const hasOpenedIds = hasValues(openedIds)

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
                    <Item id={id} index={index} key={id} {...props} />
                  )}
                </VList>
              </VscodeFormHelper>
            </VscodeFormGroup>
          </VscodeFormContainer>
          <Menu
            data={[
              INTERNAL_REMOUNT.menu,
              {
                label: `${hasOpenedIds ? 'Collapse' : 'Expand'} ${pluralize((hasOpenedIds ? openedIds : closedIds).length, 'item')}`,
                onClick: () => {
                  store.set(({draft}) => {
                    for (const id of ids)
                      draft[id] = {
                        ...draft[id],
                        open: !hasOpenedIds
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
  )
}
