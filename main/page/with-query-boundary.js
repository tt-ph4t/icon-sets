import {useQuery} from '@tanstack/react-query'

import {Boundary} from '../components/boundary'
import {ProgressRing} from '../components/progress-ring'
import {component} from '../hocs'
import {DEFAULT_QUERY_OPTIONS} from '../misc/constants'

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

export default Component =>
  component(props => {
    const query = useQuery(DEFAULT_QUERY_OPTIONS)

    return (
      <Boundary.Query
        fallback={fallback}
        query={query}
        render={() => <Component {...props} />}
      />
    )
  })
