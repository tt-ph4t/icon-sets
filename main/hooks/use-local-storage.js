import {useLocalStorageState} from 'ahooks'
import {constantCase} from 'change-case'
import {safeDestr} from 'destr'

export const useLocalStorage = (key, options) =>
  useLocalStorageState(constantCase(key), {
    deserializer: safeDestr,
    listenStorageChange: true,
    ...options
  })
