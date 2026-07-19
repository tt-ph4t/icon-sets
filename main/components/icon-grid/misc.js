import {useBatcher} from '@tanstack/react-pacer'
import {Sketch} from '@uiw/react-color'
import {VscodeToolbarContainer} from '@vscode-elements/react-elements'
import {play} from 'cuelume'
import {last} from 'es-toolkit'
import randomColor from 'randomcolor'

import {component} from '../../hocs'
import {useCustomizedIcons} from '../../hooks/use-customized-icons'
import {
  DEFAULT_ICON_CUSTOMISATIONS,
  ICON_CACHE,
  THEME
} from '../../misc/constants'
import {Clipboard} from '../clipboard'
import {Popover} from '../popover'
import {Slot} from '../slot'
import {ToolbarButton} from '../toolbar-button'

export const ColorPicker =
  // https://github.com/colorjs/color-name
  component(props => {
    const customizedIconsStore = useCustomizedIcons.useStore()

    const batcher = useBatcher(items => {
      last(items)()
      ICON_CACHE.clear()
    })

    const iconOptions = customizedIconsStore.useSelectValue(({draft}) => ({
      color: draft.global.color
    }))

    return (
      <Popover.Primitive
        popupRender={
          <>
            <Slot
              onChange={colorResult => {
                play('tick')

                batcher.addItem(() => {
                  customizedIconsStore.set(({draft}) => {
                    draft.global.color = colorResult.hexa
                  })
                })
              }}
              style={THEME.CARD_STYLE}>
              <Sketch
                color={iconOptions.color}
                editableDisable={false}
                presetColors={false}
                width={300}
                {...props}
              />
            </Slot>
            <div
              style={{
                display: 'flex',
                placeContent: 'space-between'
              }}>
              <Clipboard value={iconOptions.color}>
                {iconOptions.color}
              </Clipboard>
              <VscodeToolbarContainer>
                <ToolbarButton
                  icon='wand'
                  onClick={() => {
                    batcher.addItem(() => {
                      customizedIconsStore.set(({draft}) => {
                        draft.global.color = randomColor()
                      })
                    })
                  }}
                />
                <ToolbarButton
                  icon='eraser'
                  onClick={() => {
                    batcher.addItem(() => {
                      customizedIconsStore.set(({draft}) => {
                        draft.global.color = DEFAULT_ICON_CUSTOMISATIONS.color
                      })
                    })
                  }}
                />
              </VscodeToolbarContainer>
            </div>
          </>
        }
        render={
          <ToolbarButton
            checked={iconOptions.color !== DEFAULT_ICON_CUSTOMISATIONS.color}
            icon='paintcan'
            preventToggle
          />
        }
      />
    )
  })

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
