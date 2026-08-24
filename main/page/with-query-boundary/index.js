import {useQuery} from '@tanstack/react-query'

import {Boundary} from '../../components/boundary'
import {ProgressRing} from '../../components/progress-ring'
import {component} from '../../hocs'
import {DATABASE_URL} from '../../misc/constants'
import {getQueryOptions} from '../../misc/get-query-options'

const fallback = (
  <div
    style={{
      alignContent: 'center',
      inset: 0,
      justifySelf: 'center',
      pointerEvents: 'none',
      position: 'absolute',
      zIndex: 1
    }}>
    <div
      style={{
        pointerEvents: 'auto'
      }}>
      <ProgressRing>Loading data</ProgressRing>
    </div>
  </div>
)

const renderError = Component => <Component progressBar={false} />

const queryFnWorker = new ComlinkWorker(
  new URL('./query-fn.worker', import.meta.url)
)

const queryOptions = getQueryOptions.worker(queryFnWorker, {
  url: `${DATABASE_URL}/index.msgpack`
})

export default Component =>
  component(props => {
    const query = useQuery(queryOptions)

    return (
      <Boundary.Query
        fallback={fallback}
        query={query}
        render={() => <Component {...props} />}
        renderError={renderError}
      />
    )
  })
