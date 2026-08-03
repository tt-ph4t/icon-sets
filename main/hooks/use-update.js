import {useUpdate as useUpdate_} from 'ahooks'
import {partial} from 'es-toolkit'

import {useProgress} from '../components/progress'
import {useCallback} from './use-callback'

export const useUpdate = () => {
  const update = useUpdate_()
  const progress = useProgress()

  return useCallback(partial(progress.with, update))
}
