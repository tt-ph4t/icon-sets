import {useHotkey, useHotkeys} from '@tanstack/react-hotkeys'
import {VscodeIcon, VscodeTextfield} from '@vscode-elements/react-elements'
import React from 'react'

import {component} from '../../hocs'
import {useCallback} from '../../hooks/use-callback'
import {useEffect} from '../../hooks/use-effect'
import {useRef} from '../../hooks/use-ref'
import {isWordChar} from '../../misc'
import {EMPTY} from '../../misc/constants'
import {Input} from '../input'
import {Kbd} from '../kbd'
import {Menu} from '../menu'
import {Slot} from '../slot'
import ColorPicker from './color-picker'
import {SquareToggle} from './misc'
import useStore from './use-store'

const hotkeys = ['/', 'ctrl + f', 'ctrl + k', 'ctrl + e']

const hotkeysMenu = [
  'Hotkeys',
  ...hotkeys.map(hotkey => ({
    disabled: true,
    label: Kbd.text(hotkey)
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
      <Input
        as={VscodeTextfield}
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
