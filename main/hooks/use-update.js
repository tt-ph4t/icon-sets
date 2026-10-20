import {useUpdate as _useUpdate} from 'ahooks'

import {useProgress} from '../components/progress'
import {useCallback} from './use-callback'

export const useUpdate = () => {
  const update = _useUpdate()
  const progress = useProgress()

  return useCallback(() => {
    progress.with(update)
  })
}
