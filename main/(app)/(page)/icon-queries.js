import {useDebouncer} from '@tanstack/react-pacer'
import {useQuery, useQueryClient} from '@tanstack/react-query'
import {mapValues, pick, sumBy} from 'es-toolkit'
import {size} from 'es-toolkit/compat'
import ms from 'ms'

import {Menu} from '../components/menu'
import {ToolbarButton} from '../components/toolbar-button'
import {component} from '../hocs'
import {useCallback} from '../hooks/use-callback'
import {useState} from '../hooks/use-state'
import {getId, hasValues} from '../misc'
import {
  DATABASE_URL,
  DEFAULT_QUERY_OPTIONS,
  EMPTY_OBJECT,
  QUERY_CLIENT_ACTIONS
} from '../misc/constants'
import {getQueryOptions} from '../misc/get-query-options'
import {pluralize} from '../misc/pluralize'
import {prettyBytes} from '../misc/pretty-bytes'

const defaultQueryOptions = {
  exact: true,
  gcTime: ms('10m')
}

const queryClientActions = [
  ['Prefetch', 'prefetchQuery'],
  ...QUERY_CLIENT_ACTIONS
]

export default component(() => {
  const queryClient = useQueryClient()
  const [state, setState] = useState(EMPTY_OBJECT)

  const debouncer = useDebouncer(async fn => await fn(), {
    wait: ms('1s')
  })

  const internalQueryClient = useCallback(
    async (queryClientAction, iconSet) => {
      if (hasValues(iconSet))
        for (const icon of iconSet.icons)
          await queryClient[queryClientAction](
            getQueryOptions({
              ...defaultQueryOptions,
              queryKey: getId(iconSet.prefix, icon),
              url: `${DATABASE_URL}/${iconSet.prefix}/${icon}.msgpack`
            })
          )
    }
  )

  useQuery({
    ...DEFAULT_QUERY_OPTIONS,
    enabled: hasValues(state),
    select: async ({[state.iconSetPrefix]: iconSet}) => {
      await internalQueryClient(state.queryClientAction, iconSet)
    }
  })

  const query = useQuery({
    ...DEFAULT_QUERY_OPTIONS,
    select: useCallback(iconSets => ({
      menu: [
        ...Object.entries(
          Object.groupBy(
            Object.values(iconSets).map(iconSet => ({
              label: `${iconSet.name} (${iconSet.icons.length})`,
              menu: [
                {
                  description: prettyBytes(0),
                  label: 'Download'
                },
                {
                  separator: true
                },
                ...queryClientActions.map(([a, b]) => ({
                  label: a,
                  onClick: () => {
                    debouncer.maybeExecute(() => {
                      setState({
                        iconSetPrefix: iconSet.prefix,
                        queryClientAction: b
                      })
                    })
                  }
                }))
              ]
            })),
            ({label}) => label[0].toUpperCase()
          )
        ).flatMap(([a, b]) => [a, ...b]),
        {
          separator: true
        },
        `${pluralize(size(iconSets), 'icon set')} (${pluralize(
          sumBy(Object.values(iconSets), iconSet => iconSet.icons.length),
          'icon'
        )})`,
        ...queryClientActions.map(([a, b]) => ({
          label: `unstable_${a}_all`.toUpperCase(),
          onClick: () => {
            debouncer.maybeExecute(() => {
              mapValues(iconSets, async iconSet => {
                await internalQueryClient(b, iconSet)
              })
            })
          }
        }))
      ]
    }))
  })

  if (query.isSuccess)
    return (
      <debouncer.Subscribe selector={state => pick(state, ['isPending'])}>
        {state => (
          <Menu
            data={query.data.menu}
            render={
              <ToolbarButton
                checked={state.isPending}
                icon='symbol-field'
                preventToggle
              />
            }
          />
        )}
      </debouncer.Subscribe>
    )
})
