import {QueryClientProvider, useQuery} from '@tanstack/react-query'

import {component} from '../../hocs'
import {GITHUB_REPO, QUERY_CLIENT} from '../../misc/constants'
import {getQueryOptions} from '../../misc/get-query-options'

const queryOptions = getQueryOptions({
  select: ({devDependencies}) => devDependencies['@iconify/json'],
  url: `https://raw.githubusercontent.com/${GITHUB_REPO}/refs/heads/data/package.json`
})

const DataVersion = component(() => {
  const query = useQuery(queryOptions)

  if (query.isSuccess) return query.data
})

export default component(() => (
  <QueryClientProvider client={QUERY_CLIENT.MISC}>
    <DataVersion />
  </QueryClientProvider>
))
