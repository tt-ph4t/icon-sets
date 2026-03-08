import { useAsyncEffect, useUpdateEffect } from 'ahooks'
import { mapValues } from 'es-toolkit'
import React from 'react'

import { useDeepCompareMemoize } from './use-deep-compare-memoize'

export const useEffect = Object.assign(
  useDeepCompareMemoize.with(React.useEffect),
  mapValues(
    {
      Async: useAsyncEffect,
      Update: useUpdateEffect
    },
    useDeepCompareMemoize.with
  )
)
