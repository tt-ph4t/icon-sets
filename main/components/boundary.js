import {useQueryClient} from '@tanstack/react-query'
import {play} from 'cuelume'
import React from 'react'
import {ErrorBoundary} from 'react-error-boundary'

import {Fallback} from '../components/fallback'
import {component} from '../hocs'
import {DEFAULT_QUERY_OPTIONS} from '../misc/constants'
import {Slot} from './slot'

const defaultProps = {
  FallbackComponent: component(({error, resetErrorBoundary}) => (
    <Fallback.Error error={error} onRetry={resetErrorBoundary} />
  )),
  onError: () => {
    play('error')
  }
}

export const Boundary = Object.assign(
  component(({children, fallback = Fallback.ProgressBar, ...props}) => (
    <Boundary.Error
      FallbackComponent={defaultProps.FallbackComponent}
      {...props}>
      <React.Suspense fallback={fallback}>{children}</React.Suspense>
    </Boundary.Error>
  )),
  {
    Error: component(props => (
      <Slot onError={defaultProps.onError}>
        <ErrorBoundary {...props} />
      </Slot>
    )),
    Query: component(
      ({
        fallback = Fallback.ProgressBar,
        query,
        queryOptions = DEFAULT_QUERY_OPTIONS,
        render,
        renderError = true
      }) => {
        const queryClient = useQueryClient()

        if (query.isLoading)
          return Slot.render({
            bespoke: fallback
          })

        if (query.isError)
          return Slot.render({
            bespoke: renderError,
            default: props => (
              <Slot
                onRetry={async () => {
                  await queryClient.resetQueries({
                    exact: true,
                    queryKey: queryOptions.queryKey
                  })
                }}>
                <Fallback.Error error={query.error} {...props} />
              </Slot>
            )
          })

        return Slot.render(render)
      }
    ),
    with: (Component, BoundaryProps) =>
      component(props => (
        <Boundary {...BoundaryProps}>
          <Component {...props} />
        </Boundary>
      ))
  }
)
