import {QueryClientProvider, useQuery} from '@tanstack/react-query'

import {component} from '../../hocs'
import {DATABASE_URL, QUERY_CLIENT} from '../../misc/constants'
import {getQueryOptions} from '../../misc/get-query-options'

const queryOptions = getQueryOptions({
  select: pkg => pkg.devDependencies['@iconify/json'],
  url: `${DATABASE_URL}/package.json`
})

const DataVersion = component(() => useQuery(queryOptions).data)

export default (
  <QueryClientProvider client={QUERY_CLIENT.MISC}>
    <DataVersion />
  </QueryClientProvider>
)
