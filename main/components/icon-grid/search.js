import {useHotkey, useHotkeys} from '@tanstack/react-hotkeys'
import {VscodeIcon, VscodeTextfield} from '@vscode-elements/react-elements'
import React from 'react'

import {component} from '../../hocs'
import {useCallback} from '../../hooks/use-callback'
import {useCustomizedIcons} from '../../hooks/use-customized-icons'
import {useEffect} from '../../hooks/use-effect'
import {useRef} from '../../hooks/use-ref'
import {isWordChar} from '../../misc'
import {EMPTY} from '../../misc/constants'
import {Input} from '../input'
import {Kbd} from '../kbd'
import {Menu} from '../menu'
import {Slot} from '../slot'
import {ToolbarButton} from '../toolbar-button'
import ColorPicker from './color-picker'
import useSearchTerm from './use-search-term'

const SquareToggle = component(props => {
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
        preventToggle
        {...props}
      />
    </Slot>
  )
})

const hotkeys = ['/', 'ctrl + f', 'ctrl + k', 'ctrl + e']

const hotkeysMenu = (
  <Menu
    data={[
      'Hotkeys',
      ...hotkeys.map(hotkey => ({
        disabled: true,
        label: Kbd.text(hotkey)
      }))
    ]}
    render={<VscodeIcon name='search' slot='content-before' />}
  />
)

const Search = component(({children, ...props}) => {
  const ref = useRef()
  const searchTerm = useSearchTerm()
  const searchTermValue = searchTerm.useValue()

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
        searchTerm.set(event.target.value)
      }}
      ref={ref}>
      <Input
        as={VscodeTextfield}
        invalid={
          !searchTerm.isDefault(searchTermValue) && !isWordChar(searchTermValue)
        }
        value={searchTermValue}
        {...props}>
        <React.Activity>
          {hotkeysMenu}
          {React.Children.map(children, children => (
            <div slot='content-after'>{children}</div>
          ))}
        </React.Activity>
      </Input>
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
