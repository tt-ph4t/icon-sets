import {PacerProvider} from '@tanstack/react-pacer'
import {QueryClientProvider} from '@tanstack/react-query'

import {QUERY_CLIENT} from './app/constants'
import {component} from './app/hocs'

export default component(({children}) => (
  <PacerProvider>
    <QueryClientProvider client={QUERY_CLIENT}>{children}</QueryClientProvider>
  </PacerProvider>
))
