import {useBatchedCallback} from '@tanstack/react-pacer'
import {useMutationObserver} from 'ahooks'
import {mapValues} from 'es-toolkit'

import {useEffect} from '../../hooks/use-effect'
import {hasValues} from '../../misc'
import {EMPTY} from '../../misc/constants'
import {withImmerAtom} from '../../misc/with-immer-atom'

const families = mapValues(
  {
    Fira: {
      monospace: 'Fira Mono',
      sansSerif: 'Fira Sans'
    },
    Geist: {
      monospace: 'Geist Mono',
      sansSerif: 'Geist'
    },
    'IBM Plex': {
      monospace: 'IBM Plex Mono',
      sansSerif: 'IBM Plex Sans'
    },
    Noto: {
      monospace: 'Noto Sans Mono',
      sansSerif: 'Noto Sans'
    },
    PT: {
      monospace: 'PT Mono',
      sansSerif: 'PT Sans'
    },
    Roboto: {
      monospace: 'Roboto Mono',
      sansSerif: 'Roboto'
    },
    Source: {
      monospace: 'Source Code Pro',
      sansSerif: 'Source Sans 3'
    }
  },
  ({monospace, sansSerif}) => ({
    monospace: `"${monospace}", monospace`,
    sansSerif: `"${sansSerif}", sans-serif`
  })
)

const useStore = withImmerAtom({
  current: families.Geist,
  default: EMPTY.OBJECT
})

const cssVariables = {
  monospace: '--vscode-editor-font-family',
  sansSerif: '--vscode-font-family'
}

export default Object.assign(useStore, {
  cssVariables,
  families,
  useInit: () => {
    const store = useStore()
    const state = store.useValue()

    const updateCssVariables = useBatchedCallback(() => {
      mapValues(cssVariables, (a, b) => {
        document.documentElement.style.setProperty(a, state.current[b])
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
  }
})
