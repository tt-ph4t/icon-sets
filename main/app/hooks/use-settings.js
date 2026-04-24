import {withImmerAtom} from '../hocs/with-immer-atom'

export const useSettings = withImmerAtom({
  devtools: import.meta.env.DEV,
  layout: {
    fullscreen: false,
    reverse: false,
    size: {
      height: 0,
      width: 0
    }
  }
})
