import {PacerProvider} from '@tanstack/react-pacer'
import {QueryClientProvider} from '@tanstack/react-query'

import {component} from '../app/hocs'
import {QUERY_CLIENT} from '../app/misc/constants'

export default component(({children}) => (
  <PacerProvider>
    <QueryClientProvider client={QUERY_CLIENT}>{children}</QueryClientProvider>
  </PacerProvider>
))
