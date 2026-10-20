import {useSize as _useSize} from 'ahooks'
import React from 'react'

import {useRef} from './use-ref'

export const useSize = () => {
  const ref = useRef()

  return {
    ref,
    ...React.useDeferredValue(_useSize(() => ref.current ?? document.body))
  }
}
