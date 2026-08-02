import {useEyeDropper} from '@reactuses/core'
import {useBatchedCallback} from '@tanstack/react-pacer'
import {Compact, Sketch} from '@uiw/react-color'
import {VscodeToolbarContainer} from '@vscode-elements/react-elements'
import {last} from 'es-toolkit'
import React from 'react'

import {component} from '../../hocs'
import {useCallback} from '../../hooks/use-callback'
import {useCustomizedIcons} from '../../hooks/use-customized-icons'
import {
  DEFAULT_ICON_CUSTOMISATIONS,
  ICON_CACHE,
  THEME
} from '../../misc/constants'
import {Clipboard} from '../clipboard'
import {ColorPicker} from '../color-picker'
import {Popover} from '../popover'
import {Slot} from '../slot'
import {ToolbarButton} from '../toolbar-button'

const EyeDropper = component(({set, ...props}) => {
  const [supported, open] = useEyeDropper()

  return (
    <Slot
      onClick={async () => {
        set((await open()).sRGBHex)
      }}>
      <ToolbarButton disabled={!supported} icon='wand' {...props} />
    </Slot>
  )
})

// https://github.com/colorjs/color-name
export default component(props => {
  const customizedIconsStore = useCustomizedIcons.useStore()

  const set = useBatchedCallback(items => {
    customizedIconsStore.set(({draft}) => {
      draft.global.color = last(items)
    })

    ICON_CACHE.clear()
  })

  const color = customizedIconsStore.useSelectValue(
    ({draft}) => draft.global.color
  )

  const isDefaultColor = color === DEFAULT_ICON_CUSTOMISATIONS.color

  const onChange = useCallback(color => {
    set(color.hexa)
  })

  return (
    <Popover.Primitive
      popupRender={
        <>
          <React.Activity>
            <VscodeToolbarContainer>
              <ToolbarButton
                disabled={isDefaultColor}
                icon='eraser'
                onClick={() => {
                  set(DEFAULT_ICON_CUSTOMISATIONS.color)
                }}
              />
              <EyeDropper set={set} />
              <Clipboard value={color}>{color}</Clipboard>
            </VscodeToolbarContainer>
          </React.Activity>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'calc(var(--SPACING) * 2)'
            }}>
            <Slot onChange={onChange} style={THEME.CARD_STYLE}>
              <ColorPicker
                as={Sketch}
                color={color}
                editableDisable={false}
                presetColors={false}
                width={300}
                {...props}
              />
            </Slot>
            <Slot
              onChange={onChange}
              style={{
                ...THEME.CARD_STYLE,
                padding: 'calc(var(--SPACING) * 2)'
              }}>
              <ColorPicker as={Compact} color={color} {...props} />
            </Slot>
          </div>
        </>
      }
      render={
        <ToolbarButton
          checked={!isDefaultColor}
          icon='paintcan'
          preventToggle
        />
      }
    />
  )
})
