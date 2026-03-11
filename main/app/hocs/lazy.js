import React from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { Fallback } from '../components/fallback'
import { component } from './'

const FallbackComponent = component(({ error, resetErrorBoundary }) => (
  <Fallback.Error>
    {error.message}
    <Fallback.TryAgainButton onClick={resetErrorBoundary} />
  </Fallback.Error>
))

export const lazy = load => {
  const Component = React.lazy(load)

  return component(props => (
    <ErrorBoundary FallbackComponent={FallbackComponent}>
      <React.Suspense fallback={<Fallback />}>
        <Component {...props} />
      </React.Suspense>
    </ErrorBoundary>
  ))
}
