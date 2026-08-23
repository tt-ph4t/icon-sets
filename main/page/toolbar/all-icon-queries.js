import {useAsyncBatcher} from '@tanstack/react-pacer'
import {useQuery, useQueryClient} from '@tanstack/react-query'
import {useSetState} from 'ahooks'
import {last, mapValues, pick, sumBy} from 'es-toolkit'

import {Menu} from '../../components/menu'
import {ToolbarButton} from '../../components/toolbar-button'
import {component} from '../../hocs'
import {useCallback} from '../../hooks/use-callback'
import {useIconSetMenuQuery} from '../../hooks/use-icon-set-menu-query'
import {hasValues} from '../../misc'
import {DEFAULT_QUERY_OPTIONS, QUERY_CLIENT_MENU} from '../../misc/constants'
import {getQueryOptions} from '../../misc/get-query-options'
import {pluralize} from '../../misc/pluralize'
import dataVersion from './data-version'

const queryClientMenu = {
  Prefetch: 'query',
  ...QUERY_CLIENT_MENU
}

export default component(() => {
  const queryClient = useQueryClient()

  const [state, setState] = useSetState({
    iconSetPrefix: undefined,
    queryClientMethod: undefined
  })

  const asyncBatcher = useAsyncBatcher(async items => {
    if (confirm()) await last(items)()
  })

  const _queryClient = useCallback(async (method, iconSet) => {
    if (hasValues(iconSet))
      await Promise.all(
        iconSet.icons.map(async icon => {
          await queryClient[method](
            getQueryOptions.icon(iconSet.prefix, icon, {
              exact: true,
              gcTime: 0
            })
          )
        })
      )
  })

  useQuery({
    ...DEFAULT_QUERY_OPTIONS,
    select: async ({[state.iconSetPrefix]: iconSet}) => {
      if (hasValues(state)) await _queryClient(state.queryClientMethod, iconSet)
    }
  })

  const iconSetMenuQuery = useIconSetMenuQuery(iconSet => ({
    menu: [
      {
        label: 'Download'
      },
      'Query',
      ...Object.entries(queryClientMenu).map(([a, b]) => ({
        label: a,
        onClick: async () => {
          await asyncBatcher.addItem(() => {
            setState({
              iconSetPrefix: iconSet.prefix,
              queryClientMethod: b
            })
          })
        }
      }))
    ]
  }))

  const query = useQuery({
    ...DEFAULT_QUERY_OPTIONS,
    select: useCallback(iconSets => {
      const iconCount = sumBy(
        Object.values(iconSets),
        iconSet => iconSet.icons.length
      )

      const iconCountLabel = pluralize(iconCount, 'icon')

      return {
        menu: [
          {
            label: iconCountLabel,
            menu: [
              {
                label: 'Download'
              },
              'Query',
              ...Object.entries(queryClientMenu).map(([a, b]) => ({
                label: a,
                onClick: async () => {
                  await asyncBatcher.addItem(() => {
                    mapValues(iconSets, async iconSet => {
                      await _queryClient(b, iconSet)
                    })
                  })
                }
              }))
            ],
            onClick: () => {
              prompt(pluralize(iconSets, 'icon set'), iconCountLabel)
            }
          },
          {
            separator: true
          },
          ...iconSetMenuQuery.data
        ]
      }
    })
  })

  return (
    <asyncBatcher.Subscribe
      selector={asyncBatcherState => pick(asyncBatcherState, ['isPending'])}>
      {asyncBatcherState => (
        <Menu
          data={query.data.menu}
          render={
            <ToolbarButton checked={asyncBatcherState.isPending} controlled>
              {dataVersion}
            </ToolbarButton>
          }
        />
      )}
    </asyncBatcher.Subscribe>
  )
})
