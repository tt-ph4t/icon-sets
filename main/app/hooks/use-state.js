import {useLocalStorageState, useSafeState} from 'ahooks'
import {destr} from 'destr'

export const useState = Object.assign(useSafeState, {
  LocalStorage: (
    key,
    {deserializer = destr, listenStorageChange = true, ...options}
  ) =>
    useLocalStorageState(key, {
      deserializer,
      listenStorageChange,
      ...options
    })
})
