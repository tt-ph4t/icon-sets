import {formatForDisplay, useHotkey, useHotkeys} from '@tanstack/react-hotkeys'
import {useBatcher} from '@tanstack/react-pacer'
import {Sketch} from '@uiw/react-color'
import {
  VscodeIcon,
  VscodeTextfield,
  VscodeToolbarContainer
} from '@vscode-elements/react-elements'
import {last} from 'es-toolkit'
import randomColor from 'randomcolor'
import React from 'react'

import {component} from '../../hocs'
import {useCallback} from '../../hooks/use-callback'
import {useCustomizedIcons} from '../../hooks/use-customized-icons'
import {useEffect} from '../../hooks/use-effect'
import {useRef} from '../../hooks/use-ref'
import {isWordChar} from '../../misc'
import {
  DEFAULT_ICON_CUSTOMISATIONS,
  EMPTY,
  ICON_CACHE,
  THEME
} from '../../misc/constants'
import {Clipboard} from '../clipboard'
import {Menu} from '../menu'
import {Popover} from '../popover'
import {Slot} from '../slot'
import {ToolbarButton} from '../toolbar-button'
import useStore from './use-store'

const ColorPicker =
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

const SquareToggle = component(props => {
  const customizedIconsStore = useCustomizedIcons.useStore()

  const ToolbarButtonProps = customizedIconsStore.useSelectValue(({draft}) => ({
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
        icon='symbol-ruler'
        toggleable
        {...ToolbarButtonProps}
        {...props}
      />
    </Slot>
  )
})

const hotkeys = ['/', 'ctrl + f', 'ctrl + k', 'ctrl + e']

const hotkeysMenu = [
  'Hotkeys',
  ...hotkeys.map(hotkey => ({
    disabled: true,
    label: formatForDisplay(hotkey)
  }))
]

const Search = component(({children, ...props}) => {
  const ref = useRef()
  const store = useStore()
  const {searchTerm} = store.useSelectValue('searchTerm')

  const focusFn = useCallback(() => {
    ref.current.focus()
  })

  useHotkey('esc', () => {
    ref.current.blur()
  })

  useHotkeys(
    hotkeys.map(hotkey => ({
      callback: focusFn,
      hotkey
    }))
  )

  useEffect.update(() => {
    ref.current = ref.current.renderRoot.querySelector('input')
  }, EMPTY.ARRAY)

  return (
    <Slot
      onInput={event => {
        store.searchTerm.set(event.target.value)
      }}
      ref={ref}>
      <VscodeTextfield
        invalid={
          !store.searchTerm.isDefault(searchTerm) && !isWordChar(searchTerm)
        }
        value={searchTerm}
        {...props}>
        <React.Activity>
          <Menu
            data={hotkeysMenu}
            render={<VscodeIcon name='search' slot='content-before' />}
          />
          {React.Children.map(children, children => (
            <div slot='content-after'>{children}</div>
          ))}
        </React.Activity>
      </VscodeTextfield>
    </Slot>
  )
})

export default component(({children, ...props}) => (
  <Search {...props}>
    <SquareToggle />
    <ColorPicker />
    {children}
  </Search>
))
