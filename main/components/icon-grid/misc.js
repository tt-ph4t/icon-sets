import {component} from '../../hocs'
import {useCustomizedIcons} from '../../hooks/use-customized-icons'
import {Slot} from '../slot'
import {ToolbarButton} from '../toolbar-button'

export const SquareToggle = component(props => {
  const customizedIconsStore = useCustomizedIcons.useStore()

  const defaultProps = customizedIconsStore.useSelectValue(({draft}) => ({
    checked: draft.global.square
  }))

  return (
    <Slot
      onChange={event => {
        customizedIconsStore.set(({draft}) => {
          draft.global.square = event.target.checked
        })
      }}>
      <ToolbarButton
        {...defaultProps}
        icon='symbol-ruler'
        toggleable
        {...props}
      />
    </Slot>
  )
})
