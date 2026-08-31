import {useBatchedCallback} from '@tanstack/react-pacer'
import {useMutationObserver} from 'ahooks'
import {mapValues} from 'es-toolkit'

import {component} from '../../hocs'
import {useEffect} from '../../hooks/use-effect'
import {hasValues} from '../../misc'
import {EMPTY} from '../../misc/constants'
import {withImmerAtom} from '../../misc/with-immer-atom'

const fallbackMap = {
  monospace: 'monospace',
  sansSerif: 'sans-serif'
}

const families = mapValues(
  {
    Geist: {
      monospace: 'Geist Mono',
      sansSerif: 'Geist'
    },
    'IBM Plex': {
      monospace: 'IBM Plex Mono',
      sansSerif: 'IBM Plex Sans'
    },
    Inter: {
      sansSerif: 'Inter'
    },
    Noto: {
      monospace: 'Noto Sans Mono',
      sansSerif: 'Noto Sans'
    },
    Roboto: {
      monospace: 'Roboto Mono',
      sansSerif: 'Roboto'
    }
  },
  a => mapValues(a, (a, b) => `"${a}", ${fallbackMap[b]}`)
)

const useStore = withImmerAtom({
  current: families.Roboto,
  default: EMPTY.OBJECT
})

const cssVariables = {
  monospace: '--vscode-editor-font-family',
  sansSerif: '--vscode-font-family'
}

export default {
  cssVariables,
  families,
  Init: component(() => {
    const store = useStore()
    const state = store.useValue()

    const updateCssVariables = useBatchedCallback(() => {
      mapValues(cssVariables, (a, b) => {
        document.documentElement.style.setProperty(
          a,
          state.current[b] ?? state.default[b]
        )
      })
    })

    useEffect.once(() => {
      updateCssVariables()

      if (!hasValues(state.default))
        store.set(({draft}) => {
          draft.default = mapValues(cssVariables, a =>
            document.documentElement.style.getPropertyValue(a)
          )
        })
    })

    useEffect(() => {
      document.documentElement.dataset.fontUpdatedAt = Date.now()
    }, [state.current])

    useMutationObserver(updateCssVariables, document.documentElement, {
      attributeFilter: ['data-font-updated-at', 'style']
    })
  }),
  useStore
}
