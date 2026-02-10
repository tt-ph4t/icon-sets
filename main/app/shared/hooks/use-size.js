import { useSize as useSize1 } from 'ahooks'
import React from 'react'

import { useRef } from './use-ref'

export const useSize = () => {
  const ref = useRef()
  const size = useSize1(() => ref.current ?? document.querySelector('body'))

  return { ref, ...React.useDeferredValue(size) }
}
