import { useSize as useSize1 } from 'ahooks'
import React from 'react'

import { useRef } from './use-ref'

export const useSize = () => {
  const ref = useRef()

  return {
    ref,
    ...React.useDeferredValue(
      useSize1(() => ref.current ?? document.querySelector('body'))
    )
  }
}
