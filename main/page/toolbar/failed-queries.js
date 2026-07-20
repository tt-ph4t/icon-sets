import {useQueryClient} from '@tanstack/react-query'

import {ToolbarButton} from '../../components/toolbar-button'
import {component} from '../../hocs'
import {useIsQueryBusy} from '../../hooks/use-is-query-busy'
import {hasValues} from '../../misc'
import {pluralize} from '../../misc/pluralize'

const queryClientFilters = {
  predicate: query => query.state.status === 'error'
}

export default component(() => {
  const queryClient = useQueryClient()
  const queries = queryClient.getQueryCache().findAll(queryClientFilters)

  useIsQueryBusy()

  return (
    hasValues(queries) && (
      <ToolbarButton
        icon='error'
        onClick={async () => {
          await queryClient.refetchQueries(queryClientFilters)
        }}>
        {pluralize(queries.length, 'failed query')}. Retry?
      </ToolbarButton>
    )
  )
})
