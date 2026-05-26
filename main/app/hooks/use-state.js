import {useLocalStorageState, useSafeState} from 'ahooks'
import {constantCase} from 'change-case'
import {safeDestr} from 'destr'

export const useState = Object.assign(useSafeState, {
  localStorage: (
    key,
    {deserializer = safeDestr, listenStorageChange = true, ...options}
  ) =>
    useLocalStorageState(constantCase(key), {
      deserializer,
      listenStorageChange,
      ...options
    })
})
