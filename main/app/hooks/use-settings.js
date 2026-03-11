import { withImmerAtom } from '../hocs'

export const useSettings = withImmerAtom({
  current: {
    isFullscreen: false,
    reverseLayout: false,
    showDevtools: false,
    squareIcon: true
  }
})
