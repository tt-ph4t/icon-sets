import {formatForDisplay, useHotkey, useHotkeys} from '@tanstack/react-hotkeys'
import {useBatcher} from '@tanstack/react-pacer'
import {Sketch} from '@uiw/react-color'
import {
  VscodeIcon,
  VscodeTextfield,
  VscodeToolbarContainer
} from '@vscode-elements/react-elements'
import {last} from 'es-toolkit'
import {Slot} from 'radix-ui'
import randomColor from 'randomcolor'
import React from 'react'

import {component} from '../../hocs'
import {useCallback} from '../../hooks/use-callback'
import {useCustomizedIcons} from '../../hooks/use-customized-icons'
import {useEffect} from '../../hooks/use-effect'
import {useRef} from '../../hooks/use-ref'
import {isWordCharacter} from '../../misc'
import {
  DEFAULT_ICON_CUSTOMISATIONS,
  EMPTY,
  ICON_CACHE,
  THEME
} from '../../misc/constants'
import {Clipboard} from '../clipboard'
import {Menu} from '../menu'
import {Popover} from '../popover'
import {ToolbarButton} from '../toolbar-button'
import useStore from './use-store'

const ColorPicker =
  // https://github.com/colorjs/color-name
  component(() => {
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
            <Sketch
              color={iconOptions.color}
              editableDisable={false}
              onChange={colorResult => {
                batcher.addItem(() => {
                  customizedIconsStore.set(({draft}) => {
                    draft.global.color = colorResult.hexa
                  })
                })
              }}
              presetColors={false}
              style={THEME.CARD_STYLE}
              width={300}
            />
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

const SquareToggle = component(() => {
  const customizedIconsStore = useCustomizedIcons.useStore()

  const ToolbarButtonProps = customizedIconsStore.useSelectValue(({draft}) => ({
    checked: draft.global.square
  }))

  return (
    <ToolbarButton
      icon='symbol-ruler'
      onChange={event => {
        customizedIconsStore.set(({draft}) => {
          draft.global.square = event.target.checked
        })
      }}
      toggleable
      {...ToolbarButtonProps}
    />
  )
})

const hotkeys = ['/', 'ctrl + f', 'ctrl + k', 'ctrl + e']

const Search = component(({children}) => {
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
    <Slot.Root ref={ref}>
      <VscodeTextfield
        invalid={
          !store.searchTerm.isDefault(searchTerm) &&
          !isWordCharacter(searchTerm)
        }
        onInput={event => {
          store.searchTerm.set(event.target.value)
        }}
        value={searchTerm}>
        <React.Activity>
          <Menu
            data={[
              'Hotkeys',
              ...hotkeys.map(hotkey => ({
                disabled: true,
                label: formatForDisplay(hotkey)
              }))
            ]}
            render={<VscodeIcon name='search' slot='content-before' />}
          />
          {React.Children.map(children, children => (
            <div slot='content-after'>{children}</div>
          ))}
        </React.Activity>
      </VscodeTextfield>
    </Slot.Root>
  )
})

export default component(({children}) => (
  <Search>
    <SquareToggle />
    <ColorPicker />
    {children}
  </Search>
))
