import { useQuery } from '@tanstack/react-query'

import { ICON_SETS_URL } from '../../constants'
import { withImmerAtom } from '../../hocs'
import { useEffect } from '../../hooks/use-effect'
import { useRef } from '../../hooks/use-ref'
import { getQueryOptions } from '../../utils'

export const useStore = withImmerAtom({
  selectedIconSetPrefixes: []
})

export const useInit = () => {
  const ref = useRef(true)
  const store = useStore()

  const query = useQuery(
    getQueryOptions({
      select: Object.keys,
      url: ICON_SETS_URL
    })
  )

  useEffect(() => {
    if (ref.current)
      store.set(({ draft }) => {
        draft.selectedIconSetPrefixes = query.data
      })

    return () => {
      ref.current = false
    }
  }, [])
}
