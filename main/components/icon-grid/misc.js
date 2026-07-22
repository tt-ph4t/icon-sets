import {useBatchedCallback} from '@tanstack/react-pacer'
import {Sketch} from '@uiw/react-color'
import {VscodeToolbarContainer} from '@vscode-elements/react-elements'
import {play} from 'cuelume'
import {last} from 'es-toolkit'
import React from 'react'

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

    const set = useBatchedCallback(
      items => {
        customizedIconsStore.set(last(items))
        ICON_CACHE.clear()
      },
      {
        onItemsChange: () => {
          play('tick')
        }
      }
    )

    const iconOptions = customizedIconsStore.useSelectValue(({draft}) => ({
      color: draft.global.color
    }))

    return (
      <Popover.Primitive
        popupRender={
          <>
            <React.Activity>
              <VscodeToolbarContainer>
                <ToolbarButton
                  icon='eraser'
                  onClick={() => {
                    set(({draft}) => {
                      draft.global.color = DEFAULT_ICON_CUSTOMISATIONS.color
                    })
                  }}
                />
                <Clipboard value={iconOptions.color}>
                  {iconOptions.color}
                </Clipboard>
              </VscodeToolbarContainer>
            </React.Activity>
            <Slot
              onChange={colorResult => {
                set(({draft}) => {
                  draft.global.color = colorResult.hexa
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
