import { useLocalStorageState as useLocalStorageState1 } from 'ahooks'
import { destr } from 'destr'

export const useLocalStorageState = (
  key,
  { deserializer = destr, listenStorageChange = true, ...options }
) =>
  useLocalStorageState1(key, {
    deserializer,
    listenStorageChange,
    ...options
  })
