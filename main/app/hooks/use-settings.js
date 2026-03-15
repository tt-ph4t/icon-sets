import { withImmerAtom } from '../hocs'

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
    showDevtools: false,
    squareIcon: true
  }
})
