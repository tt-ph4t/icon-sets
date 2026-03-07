import { useAsyncEffect, useUpdateEffect } from 'ahooks'
import { mapValues } from 'es-toolkit'
import React from 'react'

import { withDeepCompareDeps } from './use-deep-compare-memoize'

export const useEffect = Object.assign(
  withDeepCompareDeps(React.useEffect),
  mapValues(
    {
      Async: useAsyncEffect,
      Update: useUpdateEffect
    },
    withDeepCompareDeps
  )
)
