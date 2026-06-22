import {useEventListener} from 'ahooks'
import Cycled from 'cycled'
import {asyncNoop} from 'es-toolkit'

import {component} from '../hocs'
import {useEffect} from '../hooks/use-effect'
import {useRef} from '../hooks/use-ref'
import {EMPTY} from '../misc/constants'
import {withImmerAtom} from '../misc/with-immer-atom'
import {useProgress} from './progress'

const defaultIds = EMPTY.ARRAY
const cycled = new Cycled(defaultIds)
const changeEvent = new Event('change')

const useStore = withImmerAtom({
  id: '',
  ids: defaultIds,
  set: asyncNoop
})

export const useTheme = () => {
  const state = useStore().useValue()

  return {
    ...state,
    cycled,
    isDark: state.id.includes('dark')
  }
}

export const VscodeDevToolbar = component(props => {
  const ref = useRef()
  const selectorElementRef = useRef()
  const store = useStore()
  const state = store.useValue()
  const progress = useProgress()

  useEffect.once(() => {
    const selectorElement = ref.current.shadowRoot
      .querySelector('vscode-theme-selector')
      .shadowRoot.querySelector('#theme-selector')

    selectorElementRef.current = selectorElement

    const ids = Iterator.from(selectorElement.options)
      .map(option => ({
        label: option.textContent,
        value: option.value
      }))
      .toArray()

    cycled.push(...ids)
    cycled.index = ids.findIndex(id => id.value === selectorElement.value)

    store.set(({draft}) => {
      draft.id = selectorElement.value
      draft.ids = ids

      draft.set = id => {
        selectorElement.value = id

        selectorElement.dispatchEvent(changeEvent)
      }
    })
  })

  useEventListener(
    'change',
    async () => {
      await progress.with(() => {
        cycled.index = state.ids.findIndex(
          id => id.value === selectorElementRef.current.value
        )

        store.set(({draft}) => {
          draft.id = selectorElementRef.current.value
        })
      })
    },
    {
      target: selectorElementRef
    }
  )

  return <vscode-dev-toolbar ref={ref} {...props} />
})
