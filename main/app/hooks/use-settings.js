import { withImmerAtom } from '../hocs/with-immer-atom'

export const useSettings = withImmerAtom({
  current: {
    layout: {
      fullscreen: false,
      reverse: true,
      size: {
        height: 0,
        get width() {
          return this.height
        }
      }
    },
    showDevtools: import.meta.env.DEV
  }
})
