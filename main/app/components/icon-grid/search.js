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
import {useCustomizedIcons} from '../../hooks/use-customized-icons'
import {useState} from '../../hooks/use-state'
import {isWordCharacter} from '../../misc'
import {
  DEFAULT_ICON_CUSTOMISATIONS,
  ICON_CACHE,
  THEME
} from '../../misc/constants'
import {Clipboard} from '../clipboard'
import {Popover} from '../popover'
import {ToolbarButton} from '../toolbar-button'
import useSearchQueryState from './use-search-query-state'

const ColorPicker =
  // https://github.com/colorjs/color-name
  component(() => {
    const customizedIcons = useCustomizedIcons()

    const batcher = useBatcher(items => {
      last(items)()
      ICON_CACHE.clear()
    })

    const iconOptions = customizedIcons.store.useSelectValue(({draft}) => ({
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
                  customizedIcons.store.set(({draft}) => {
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
                      customizedIcons.store.set(({draft}) => {
                        draft.global.color = randomColor()
                      })
                    })
                  }}
                />
                <ToolbarButton
                  icon='eraser'
                  onClick={() => {
                    batcher.addItem(() => {
                      customizedIcons.store.set(({draft}) => {
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
  const customizedIcons = useCustomizedIcons()

  const ToolbarButtonProps = customizedIcons.store.useSelectValue(
    ({draft}) => ({
      checked: draft.global.square
    })
  )

  return (
    <ToolbarButton
      icon='symbol-ruler'
      onChange={event => {
        customizedIcons.store.set(({draft}) => {
          draft.global.square = event.target.checked
        })
      }}
      toggleable
      {...ToolbarButtonProps}
    />
  )
})

const Search = component(({children}) => {
  const [searchQueryState, setSearchQueryState] = useSearchQueryState()
  const [state, setState] = useState(false)

  const isDefaultSearchQueryState =
    useSearchQueryState.isDefault(searchQueryState)

  return state ? (
    <VscodeTextfield
      invalid={
        !(isDefaultSearchQueryState || isWordCharacter(searchQueryState))
      }
      onInput={async event => {
        await setSearchQueryState(event.target.value)
      }}
      value={searchQueryState}>
      <VscodeIcon
        name='search'
        onClick={() => {
          setState(false)
        }}
        slot='content-before'
      />
      <React.Activity>
        {React.Children.map(children, children => (
          <div slot='content-after'>{children}</div>
        ))}
      </React.Activity>
    </VscodeTextfield>
  ) : (
    <ToolbarButton
      checked={!isDefaultSearchQueryState}
      icon='open-preview'
      onClick={() => {
        setState(true)
      }}
      preventToggle
    />
  )
})

export default component(({children}) => (
  <Search>
    <SquareToggle />
    <ColorPicker />
    {children}
  </Search>
))
