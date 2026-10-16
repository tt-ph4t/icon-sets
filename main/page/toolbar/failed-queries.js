import {useQueryClient} from '@tanstack/react-query'

import {Slot} from '../../components/slot'
import {ToolbarButton} from '../../components/toolbar-button'
import {component} from '../../hocs'
import {useIsQueryBusy} from '../../hooks/use-is-query-busy'
import {hasValues} from '../../misc'
import {pluralize} from '../../misc/pluralize'

const queryFilters = {
  predicate: query => query.state.status === 'error'
}

export default component(props => {
  const queryClient = useQueryClient()
  const queries = queryClient.getQueryCache().findAll(queryFilters)

  useIsQueryBusy()

  return (
    hasValues(queries) && (
      <Slot
        onClick={async () => {
          await queryClient.refetchQueries(queryFilters)
        }}>
        <ToolbarButton icon='error' {...props}>
          {pluralize(queries, 'failed query')}. Retry?
        </ToolbarButton>
      </Slot>
    )
  )
})
