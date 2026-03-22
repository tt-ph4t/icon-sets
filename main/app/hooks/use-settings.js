import {withImmerAtom} from '../hocs/with-immer-atom'

export const useSettings = withImmerAtom({
  layout: {
    fullscreen: false,
    reverse: false,
    size: {
      height: 0,
      width: 0
    }
  },
  showDevtools: import.meta.env.DEV
})
