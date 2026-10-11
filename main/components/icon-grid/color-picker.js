import {useEyeDropper} from '@reactuses/core'
import {useBatchedCallback} from '@tanstack/react-pacer'
import {Compact, Sketch} from '@uiw/react-color'
import {VscodeToolbarContainer} from '@vscode-elements/react-elements'
import {asyncNoop, last} from 'es-toolkit'

import {component} from '../../hocs'
import {useCallback} from '../../hooks/use-callback'
import {useCustomizedIcons} from '../../hooks/use-customized-icons'
import {useState} from '../../hooks/use-state'
import {buildContext} from '../../misc/build-context'
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

const Context = buildContext({
  setColor: asyncNoop
})

const useColor = () => {
  const color = useCustomizedIcons
    .useStore()
    .useSelectValue(({draft}) => draft.global.color)

  const {setColor} = Context.useSelectValue('setColor')

  return {
    current: color,
    isDefault: color === DEFAULT_ICON_CUSTOMISATIONS.color,
    set: setColor
  }
}

const EyeDropper = component(props => {
  const [supported, open] = useEyeDropper()
  const {setColor} = Context.useSelectValue('setColor')

  return (
    <Slot
      onClick={async () => {
        setColor((await open()).sRGBHex)
      }}>
      <ToolbarButton disabled={!supported} icon='wand' {...props} />
    </Slot>
  )
})

const Pickers = component(props => {
  const color = useColor()

  const onChange = useCallback(({hexa}) => {
    color.set(hexa)
  })

  return (
    <>
      <Slot onChange={onChange} style={THEME.CARD_STYLE}>
        <ColorPicker
          as={Sketch}
          color={color.current}
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
        <ColorPicker as={Compact} color={color.current} {...props} />
      </Slot>
    </>
  )
})

const Previous = component(props => {
  const color = useColor()
  const previousColor = useState.previous(color.current)

  return (
    <Slot
      onClick={() => {
        color.set(previousColor)
      }}>
      <ToolbarButton icon='debug-step-back' {...props} />
    </Slot>
  )
})

const Copy = component(props => {
  const color = useColor()

  return (
    <Clipboard value={color.current} {...props}>
      {color.current}
    </Clipboard>
  )
})

const Reset = component(props => {
  const color = useColor()

  return (
    <Slot
      onClick={() => {
        color.set(DEFAULT_ICON_CUSTOMISATIONS.color)
      }}>
      <ToolbarButton disabled={color.isDefault} icon='eraser' {...props} />
    </Slot>
  )
})

const ColorButton = component(props => {
  const color = useColor()

  return (
    <ToolbarButton
      checked={!color.isDefault}
      controlled
      icon='paintcan'
      {...props}
    />
  )
})

// https://github.com/colorjs/color-name
export default component(props => {
  const customizedIconsStore = useCustomizedIcons.useStore()

  const setColor = useBatchedCallback(items => {
    customizedIconsStore.set(({draft}) => {
      draft.global.color = last(items) ?? draft.global.color
    })

    ICON_CACHE.clear()
  })

  return (
    <Popover.Primitive
      popupRender={
        <Context setColor={setColor}>
          <VscodeToolbarContainer>
            <Reset />
            <Previous />
            <EyeDropper />
            <Copy />
          </VscodeToolbarContainer>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'calc(var(--SPACING) * 2)'
            }}>
            <Pickers {...props} />
          </div>
        </Context>
      }
      render={<ColorButton />}
    />
  )
})
