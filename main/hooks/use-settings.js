import {withImmerAtom} from '../misc/with-immer-atom'

export const useSettings = withImmerAtom({
  isDev: import.meta.env.DEV
})
