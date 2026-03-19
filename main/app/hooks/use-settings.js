import { withImmerAtom } from '../hocs/with-immer-atom'

export const useSettings = withImmerAtom({
  layout: {
    fullscreen: false,
    reverse: false,
    size: {
      height: 0,
      get width() {
        return this.height
      }
    }
  },
  showDevtools: import.meta.env.DEV
})
