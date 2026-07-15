import {useAsyncBatcher} from '@tanstack/react-pacer'
import {useQuery, useQueryClient} from '@tanstack/react-query'
import {useSetState} from 'ahooks'
import {last, mapValues, pick, sumBy} from 'es-toolkit'
import {size} from 'es-toolkit/compat'

import {Menu} from '../../components/menu'
import {ToolbarButton} from '../../components/toolbar-button'
import {component} from '../../hocs'
import {useCallback} from '../../hooks/use-callback'
import {hasValues} from '../../misc'
import {
  DATABASE_URL,
  DEFAULT_QUERY_OPTIONS,
  QUERY_CLIENT_MENU
} from '../../misc/constants'
import {getId} from '../../misc/get-id'
import {getQueryOptions} from '../../misc/get-query-options'
import {pluralize} from '../../misc/pluralize'
import dataVersion from './data-version'

const queryClientMenu = {
  Prefetch: 'prefetchQuery',
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
            getQueryOptions({
              exact: true,
              gcTime: 0,
              queryKey: getId(iconSet.prefix, icon),
              retry: false,
              url: `${DATABASE_URL}/${iconSet.prefix}/${icon}.msgpack`
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
                onClick: () => {
                  asyncBatcher.addItem(() => {
                    mapValues(iconSets, async iconSet => {
                      await _queryClient(b, iconSet)
                    })
                  })
                }
              }))
            ],
            onClick: () => {
              prompt(pluralize(size(iconSets), 'icon set'), iconCountLabel)
            }
          },
          {
            separator: true
          },
          ...Object.entries(
            Object.groupBy(
              Object.values(iconSets).map(iconSet => ({
                label: `${iconSet.name} (${iconSet.icons.length})`,
                menu: [
                  {
                    label: 'Download'
                  },
                  'Query',
                  ...Object.entries(queryClientMenu).map(([a, b]) => ({
                    label: a,
                    onClick: () => {
                      asyncBatcher.addItem(() => {
                        setState({
                          iconSetPrefix: iconSet.prefix,
                          queryClientMethod: b
                        })
                      })
                    }
                  }))
                ]
              })),
              ({label}) => label[0].toUpperCase()
            )
          ).flatMap(([a, b]) => [a, ...b])
        ]
      }
    })
  })

  if (query.isSuccess)
    return (
      <asyncBatcher.Subscribe
        selector={asyncBatcherState => pick(asyncBatcherState, ['isPending'])}>
        {asyncBatcherState => (
          <Menu
            data={query.data.menu}
            render={
              <ToolbarButton
                checked={asyncBatcherState.isPending}
                preventToggle>
                {dataVersion}
              </ToolbarButton>
            }
          />
        )}
      </asyncBatcher.Subscribe>
    )

  return <ToolbarButton>{dataVersion}</ToolbarButton>
})
