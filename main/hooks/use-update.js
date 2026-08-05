import {useUpdate as useUpdate_} from 'ahooks'

import {useProgress} from '../components/progress'
import {useCallback} from './use-callback'

export const useUpdate = () => {
  const update = useUpdate_()
  const progress = useProgress()

  return useCallback(() => {
    progress.with(update)
  })
}
