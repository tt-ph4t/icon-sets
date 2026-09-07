import {Button} from '@base-ui/react'
import {useQueryClient} from '@tanstack/react-query'
import {getErrorMessage} from 'react-error-boundary'

import {component} from '../../../hocs'
import {useIconQuery} from '../../../hooks/use-icon-query'
import {useMemo} from '../../../hooks/use-memo'
import {useRemount} from '../../../hooks/use-remount'
import {QUERY_CLIENT_MENU, THEME} from '../../../misc/constants'
import {parseIconName} from '../../../misc/parse-icon-name'
import {Menu} from '../../menu'
import {Slot} from '../../slot'
import Context from './context'

const Fallback = component(({children, ...props}) => (
  <Slot.Cuelume.Hover
    style={{
      userSelect: 'none'
    }}>
    <Button
      nativeButton={false}
      render={<span>{children.slice(0, 3)}</span>}
      {...props}
    />
  </Slot.Cuelume.Hover>
))

export default Component =>
  useRemount.with(
    component(({iconId, index, [useRemount.key]: remount}) => {
      const {icon} = parseIconName(iconId)
      const queryClient = useQueryClient()
      const iconQuery = useIconQuery(iconId)

      const menu = useMemo(
        () =>
          Object.entries(QUERY_CLIENT_MENU).map(([a, b]) => ({
            label: a,
            onClick: async () => {
              await queryClient[b]({
                exact: true,
                queryKey: [iconId]
              })
            }
          })),
        [iconId]
      )

      const fallbackMenu = useMemo(
        () => [remount.menu, 'Query', ...menu],
        [remount.menu, menu]
      )

      if (iconQuery.isLoading)
        return (
          <Menu data={fallbackMenu} render={<Fallback>{icon.name}</Fallback>} />
        )

      if (iconQuery.isError)
        return (
          <Menu
            data={fallbackMenu}
            render={
              <Fallback
                onClick={() => {
                  prompt('Error', getErrorMessage(iconQuery.error))
                }}
                style={{
                  color: THEME.COLORS.ERROR
                }}>
                {icon.name}
              </Fallback>
            }
          />
        )

      return (
        <Context.Provider iconId={iconId} index={index}>
          <Component
            menu={[
              'Query',
              ...menu,
              {
                separator: true
              },
              remount.menu
            ]}
          />
        </Context.Provider>
      )
    })
  )
