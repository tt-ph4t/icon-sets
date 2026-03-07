import { withImmerAtom } from '../hocs'

export const useSettings = withImmerAtom({
  current: {
    reverseLayout: false,
    showDevtools: false,
    squareIcon: true
  }
})
