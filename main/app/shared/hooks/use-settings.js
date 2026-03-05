import { withImmerAtom } from '../hocs'

export const useSettings = withImmerAtom({
  current: {
    reverseLayout: true,
    showDevtools: false,
    squareIcon: true
  }
})
