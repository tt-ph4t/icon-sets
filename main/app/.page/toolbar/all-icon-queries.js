import {useAsyncBatcher} from '@tanstack/react-pacer'
import {useQuery, useQueryClient} from '@tanstack/react-query'
import {last, mapValues, pick, sumBy} from 'es-toolkit'
import {size} from 'es-toolkit/compat'

import {Menu} from '../../components/menu'
import {ToolbarButton} from '../../components/toolbar-button'
import {component} from '../../hocs'
import {useCallback} from '../../hooks/use-callback'
import {useState} from '../../hooks/use-state'
import {getId, hasValues} from '../../misc'
import {
  DATABASE_URL,
  DEFAULT_QUERY_OPTIONS,
  EMPTY,
  QUERY_CLIENT
} from '../../misc/constants'
import {getQueryOptions} from '../../misc/get-query-options'
import {pluralize} from '../../misc/pluralize'
import DataVersion from './data-version'

const queryClientActions = [
  ['Prefetch', 'prefetchQuery'],
  ...QUERY_CLIENT.ACTIONS
]

const dataVersion = <DataVersion />

export default component(() => {
  const queryClient = useQueryClient()
  const [state, setState] = useState(EMPTY.OBJECT)

  const asyncBatcher = useAsyncBatcher(async items => {
    if (confirm()) await last(items)()
  })

  const internalQueryClient = useCallback(async (method, iconSet) => {
    if (hasValues(iconSet))
      for (const icon of iconSet.icons)
        await queryClient[method](
          getQueryOptions({
            exact: true,
            gcTime: 0,
            queryKey: getId(iconSet.prefix, icon),
            url: `${DATABASE_URL}/${iconSet.prefix}/${icon}.msgpack`
          })
        )
  })

  useQuery({
    ...DEFAULT_QUERY_OPTIONS,
    enabled: hasValues(state),
    select: async ({[state.iconSetPrefix]: iconSet}) => {
      await internalQueryClient(state.queryClientMethod, iconSet)
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
            menu: queryClientActions.map(([a, b]) => ({
              label: a,
              onClick: () => {
                asyncBatcher.addItem(() => {
                  mapValues(iconSets, async iconSet => {
                    await internalQueryClient(b, iconSet)
                  })
                })
              }
            })),
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
                menu: queryClientActions.map(([a, b]) => ({
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
