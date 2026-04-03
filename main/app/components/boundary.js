import {useQueryClient} from '@tanstack/react-query'
import {useUnmount} from 'ahooks'
import React from 'react'
import {ErrorBoundary} from 'react-error-boundary'

import {Fallback} from '../components/fallback'
import {component} from '../hocs'
import {useMemo} from '../hooks/use-memo'
import {DEFAULT_QUERY_OPTIONS} from '../misc/constants'
import {renderSlot} from '../misc/render-slot'

const ErrorBoundaryProps = {
  FallbackComponent: component(({error, resetErrorBoundary}) => (
    <Fallback.Error message={error.message} tryAgainFn={resetErrorBoundary} />
  ))
}

const fallback = <Fallback />

export const Boundary = Object.assign(
  component(({children}) => (
    <ErrorBoundary {...ErrorBoundaryProps}>
      <React.Suspense fallback={fallback}>
        <React.Activity>{children}</React.Activity>
      </React.Suspense>
    </ErrorBoundary>
  )),
  {
    Query: component(
      ({query, queryOptions = DEFAULT_QUERY_OPTIONS, render}) => {
        const queryClient = useQueryClient()

        const queryFilter = useMemo(
          () => ({
            exact: true,
            queryKey: queryOptions.queryKey
          }),
          [queryOptions.queryKey]
        )

        useUnmount(async () => {
          await queryClient.cancelQueries(queryFilter)
        })

        if (query.isLoading) return fallback

        if (query.isError)
          return (
            <Fallback.Error
              message={query.error.message}
              tryAgainFn={async () => {
                await queryClient.resetQueries(queryFilter)
              }}
            />
          )

        return renderSlot({
          bespoke: true,
          default: render
        })
      }
    )
  }
)
