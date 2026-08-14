import {useQuery, useQueryClient} from '@tanstack/react-query'
import {useDocumentVisibility, useNetwork, useRafInterval} from 'ahooks'

import {component} from '../../hocs'
import {useRef} from '../../hooks/use-ref'
import {hasValues} from '../../misc'
import {DEFAULT_QUERY_OPTIONS} from '../../misc/constants'
import {getQueryOptions} from '../../misc/get-query-options'
import {withImmerAtom} from '../../misc/with-immer-atom'

const queryOptions = {
  ...DEFAULT_QUERY_OPTIONS,
  select: Object.values
}

const useStore = withImmerAtom({
  done: false,
  enabled: true
})

const defaultRef = () => 0

const PrefetchQueries = component(({enabled}) => {
  const ref1 = useRef(defaultRef)
  const ref2 = useRef(defaultRef)
  const store = useStore()
  const queryClient = useQueryClient()
  const query = useQuery(queryOptions)

  useRafInterval(() => {
    const idleCallbackId = requestIdleCallback(() => {
      if (enabled) {
        const iconSet = query.data[ref1.current]

        if (hasValues(iconSet)) {
          const icon = iconSet.icons[ref2.current]

          if (hasValues(icon)) {
            // no-await
            queryClient.prefetchQuery(
              getQueryOptions.icon(iconSet.prefix, icon, {
                gcTime: 0
              })
            )

            ref2.current++
          } else {
            ref1.current++
            ref2.current = 0
          }
        } else
          store.set(({draft}) => {
            draft.done = true
          })
      }
    })

    return () => {
      cancelIdleCallback(idleCallbackId)
    }
  }, 2e3)
})

export default Object.assign(
  component(props => {
    const network = useNetwork()
    const documentVisibility = useDocumentVisibility()
    const state = useStore().useValue()

    return (
      state.done || (
        <PrefetchQueries
          enabled={
            state.enabled &&
            documentVisibility !== 'hidden' &&
            network.online &&
            !network.saveData
          }
          {...props}
        />
      )
    )
  }),
  {
    useStore
  }
)
