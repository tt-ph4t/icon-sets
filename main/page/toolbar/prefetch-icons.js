import {isSafeInteger} from '@sindresorhus/is'
import {useQuery, useQueryClient} from '@tanstack/react-query'
import {useDocumentVisibility, useNetwork, useRafInterval} from 'ahooks'
import {castArray} from 'es-toolkit/compat'
import {find, map, pipe} from 'es-toolkit/fp'
import ms from 'ms'

import {Menu} from '../../components/menu'
import {Slot} from '../../components/slot'
import {ToolbarButton} from '../../components/toolbar-button'
import {component} from '../../hocs'
import {useRef} from '../../hooks/use-ref'
import {hasValues, numbers} from '../../misc'
import {DEFAULT_QUERY_OPTIONS} from '../../misc/constants'
import {getQueryOptions} from '../../misc/get-query-options'
import {pluralize} from '../../misc/pluralize'
import {withImmerAtom} from '../../misc/with-immer-atom'

const queryOptions = {
  ...DEFAULT_QUERY_OPTIONS,
  select: Object.values
}

const useStore = withImmerAtom({
  batchSize: 50,
  done: false,
  enabled: true,
  interval: 2000
})

const useCanPrefetch = () => {
  const network = useNetwork()
  const documentVisibility = useDocumentVisibility()

  return documentVisibility !== 'hidden' && network.online
}

const defaultRef = () => 0

const PrefetchIcons = component(({enabled}) => {
  const ref1 = useRef(defaultRef)
  const ref2 = useRef(defaultRef)
  const store = useStore()
  const queryClient = useQueryClient()
  const query = useQuery(queryOptions)
  const state = store.useSelectValue('batchSize', 'interval')

  useRafInterval(() => {
    const idleCallbackId = requestIdleCallback(() => {
      if (enabled) {
        const queries = []

        while (queries.length < state.batchSize) {
          const iconSet = query.data[ref1.current]

          if (hasValues(iconSet)) {
            const icon = iconSet.icons[ref2.current]

            if (hasValues(icon)) {
              queries.push(getQueryOptions.icon(iconSet.prefix, icon))

              ref2.current++
            } else {
              ref1.current++
              ref2.current = 0
            }
          } else {
            store.set(({draft}) => {
              draft.done = true
            })

            break
          }
        }

        for (const options of queries)
          // no-await
          queryClient.query({
            ...options,
            gcTime: 0
          })
      }
    })

    return () => {
      cancelIdleCallback(idleCallbackId)
    }
  }, state.interval)
})

export default Object.assign(
  component(() => {
    const state = useStore().useSelectValue('done', 'enabled')
    const canPrefetch = useCanPrefetch()

    return (
      state.done || <PrefetchIcons enabled={state.enabled && canPrefetch} />
    )
  }),
  {
    Actions: component(({menu, ...props}) => {
      const store = useStore()
      const state = store.useValue()
      const description = pluralize(state.batchSize, 'icon')
      const canPrefetch = useCanPrefetch()

      return (
        <Menu
          data={[
            'Background prefetch',
            {
              description,
              onClick: () => {
                store.set(({draft}) => {
                  draft.batchSize = Math.abs(
                    pipe(
                      numbers(prompt(undefined, description), {
                        splitter: ' '
                      }),
                      map(Math.round),
                      find(isSafeInteger)
                    ) ?? draft.batchSize
                  )
                })
              }
            },
            {
              description: ms(state.interval),
              label: 'Interval',
              onClick: () => {
                store.set(({draft}) => {
                  const defaultInterval = ms(draft.interval)

                  draft.interval = Math.abs(
                    ms(prompt(undefined, defaultInterval) ?? defaultInterval) ??
                      draft.interval
                  )
                })
              }
            },
            ...castArray(menu)
          ]}
          render={
            <Slot
              onClick={() => {
                store.toggle('enabled')
              }}>
              <ToolbarButton
                checked={state.enabled}
                controlled
                disabled={state.done || !canPrefetch}
                icon='cloud-download'
                {...props}
              />
            </Slot>
          }
        />
      )
    })
  }
)
