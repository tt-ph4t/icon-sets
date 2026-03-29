import {useLocalStorageState, useSafeState} from 'ahooks'
import {constantCase} from 'change-case'
import {destr} from 'destr'

export const useState = Object.assign(useSafeState, {
  LocalStorage: (
    key,
    {deserializer = destr, listenStorageChange = true, ...options}
  ) =>
    useLocalStorageState(constantCase(key), {
      deserializer,
      listenStorageChange,
      ...options
    })
})
