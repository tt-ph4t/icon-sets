import {withImmerAtom} from '../misc/with-immer-atom'

export const useSettings = withImmerAtom({
  isDev: import.meta.env.DEV,
  layout: {
    isFullscreen: false,
    isReverse: true,
    size: {
      height: 0,
      width: 0
    }
  }
})
