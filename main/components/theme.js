import {isEqual} from '@ver0/deep-equal'
import {useEventListener} from 'ahooks'
import Cycled from 'cycled'
import {asyncNoop} from 'es-toolkit'
import {map, pipe} from 'es-toolkit/fp'

import {component} from '../hocs'
import {useEffect} from '../hooks/use-effect'
import {useRef} from '../hooks/use-ref'
import {EMPTY} from '../misc/constants'
import {withImmerAtom} from '../misc/with-immer-atom'
import {useProgress} from './progress'
import {Slot} from './slot'

const changeEvent = new Event('change')

const useStore = withImmerAtom({
  id: '',
  ids: EMPTY.ARRAY,
  set: asyncNoop
})

const cycled = new Cycled(useStore.initial.ids)

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
  const progress = useProgress()
  const theme = store.useSelectValue('ids')

  useEffect.once(() => {
    if (isEqual(theme.ids, useStore.initial.ids)) {
      const selectorElement = ref.current.shadowRoot
        .querySelector('vscode-theme-selector')
        .shadowRoot.querySelector('#theme-selector')

      selectorElementRef.current = selectorElement

      const ids = pipe(
        selectorElement.options,
        map(option => ({
          label: option.textContent,
          value: option.value
        }))
      )

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
    }
  })

  useEventListener(
    changeEvent.type,
    () => {
      progress.with(() => {
        cycled.index = theme.ids.findIndex(
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

  return (
    <Slot ref={ref}>
      <vscode-dev-toolbar {...props} />
    </Slot>
  )
})
