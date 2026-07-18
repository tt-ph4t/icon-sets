import {Button} from '@base-ui/react'
import {useQueryClient} from '@tanstack/react-query'
import {useUnmount} from 'ahooks'

import {component} from '../../../hocs'
import {useCustomizedIcons} from '../../../hooks/use-customized-icons'
import {useIconQueries} from '../../../hooks/use-icon-queries'
import {useMemo} from '../../../hooks/use-memo'
import {useRemount} from '../../../hooks/use-remount'
import {QUERY_CLIENT_MENU, THEME} from '../../../misc/constants'
import {parseIconName} from '../../../misc/parse-icon-name'
import {Menu} from '../../menu'
import {Slot} from '../../slot'

const Fallback = component(({children, ...props}) => (
  <Slot
    style={{
      userSelect: 'none'
    }}>
    <Button
      nativeButton={false}
      render={<span>{children.slice(0, 3)}</span>}
      {...props}
    />
  </Slot>
))

export default Component =>
  useRemount.with(
    component(({iconId, [useRemount.key]: remount, ...props}) => {
      const {icon} = parseIconName(iconId)
      const queryClient = useQueryClient()
      const {iconCustomisations} = useCustomizedIcons.useSelect(iconId)

      const [iconQuery] = useIconQueries({
        iconCustomisations, // ?
        iconId
      })

      const queryClientFilters = useMemo(
        () => ({
          exact: true,
          queryKey: [iconId]
        }),
        [iconId]
      )

      const menu = useMemo(
        () =>
          Object.entries(QUERY_CLIENT_MENU).map(([a, b]) => ({
            label: a,
            onClick: async () => {
              await queryClient[b](queryClientFilters)
            }
          })),
        [queryClient, queryClientFilters]
      )

      const fallbackMenu = useMemo(
        () => [remount.menu, 'Query', ...menu],
        [remount.menu, menu]
      )

      useUnmount(async () => {
        await queryClient.cancelQueries(queryClientFilters)
      })

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
                  prompt('Error', iconQuery.error.message)
                }}
                style={{
                  color: `var(${THEME.COLORS.ERROR})`
                }}>
                {icon.name}
              </Fallback>
            }
          />
        )

      return (
        <Component
          iconId={iconId}
          menu={[
            {
              label: 'Query',
              menu
            },
            {
              separator: true
            },
            remount.menu
          ]}
          {...props}
        />
      )
    })
  )
