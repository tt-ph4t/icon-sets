import React from 'react'

import { useState } from './'

// https://github.com/Shopify/quilt/blob/d98672060fc724f3fe7af9a25a0845b8d7c0774a/packages/react-hooks/src/hooks/lazy-ref.ts
export const useRef = getValue => {
  const [state] = useState(getValue)

  return React.useRef(state)
}
