import {mapValues, partition} from 'es-toolkit'
import {VList} from 'virtua'

import {Menu} from '../../components/menu'
import {Slot} from '../../components/slot'
import {ToolbarButton} from '../../components/toolbar-button'
import {component} from '../../hocs'
import {useMemo} from '../../hooks/use-memo'
import {useRemount} from '../../hooks/use-remount'
import {hasValues} from '../../misc'
import {pluralize} from '../../misc/pluralize'
import {withImmerAtom} from '../../misc/with-immer-atom'
import ContentLayout from './content-layout'

export default () => {
  const useStore = withImmerAtom()

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

    return Slot.render({
      bespoke: renderItem,
      context: {
        CollapsibleProps,
        id,
        index
      }
    })
  })

  return Object.assign(
    useRemount.with(
      component(({ids, menu, [useRemount.key]: remount, ...props}) => {
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
            <ContentLayout
              style={{
                height: 'calc(var(--SIDEBAR-CONTENT-HEIGHT) * 1.5)'
              }}>
              <VList data={ids}>
                {(id, index) => (
                  <Item id={id} index={index} key={id} {...props} />
                )}
              </VList>
            </ContentLayout>
            <Menu
              data={[
                remount.menu,
                {
                  label: `${hasOpenedIds ? 'Collapse' : 'Expand'} ${pluralize(
                    (hasOpenedIds ? openedIds : closedIds).length,
                    'item'
                  )}`,
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
                ...menu
              ]}
              render={<ToolbarButton icon='kebab-vertical' slot='actions' />}
            />
          </>
        )
      })
    ),
    {
      useStore
    }
  )
}
