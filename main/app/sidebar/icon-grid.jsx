import { useQuery } from '@tanstack/react-query'
import {
  VscodeFormContainer,
  VscodeFormGroup,
  VscodeFormHelper
} from '@vscode-elements/react-elements'

import { IconGrid } from '../shared/components/icon-grid'
import { QueryBoundary } from '../shared/components/query-boundary'
import { component } from '../shared/hocs'
import { getQueryOptions } from '../shared/utils'

const queryOptions = getQueryOptions({
  url: import.meta.env.VITE_ICON_SETS_URL
})

export default component(props => {
  const query = useQuery(queryOptions)

  return (
    <QueryBoundary
      query={query}
      queryOptions={queryOptions}
      render={() => (
        <VscodeFormContainer>
          <VscodeFormGroup variant='settings-group'>
            <VscodeFormHelper
              style={{ height: 'var(--sidebar-icon-grid-height)' }}>
              <IconGrid {...props} />
            </VscodeFormHelper>
          </VscodeFormGroup>
        </VscodeFormContainer>
      )}
    />
  )
})
