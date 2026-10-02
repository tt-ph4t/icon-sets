import {isEqual} from '@ver0/deep-equal'
import {useLocalStorageState, usePrevious, useSafeState} from 'ahooks'
import {constantCase} from 'change-case'
import {safeDestr} from 'destr'
import {negate} from 'es-toolkit'

export const useState = Object.assign(useSafeState, {
  localStorage: (
    key,
    {deserializer = safeDestr, listenStorageChange = true, ...options}
  ) =>
    useLocalStorageState(constantCase(key), {
      deserializer,
      listenStorageChange,
      ...options
    }),
  previous: state => usePrevious(state, negate(isEqual))
})
