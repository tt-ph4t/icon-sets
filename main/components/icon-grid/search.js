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
import useSearchTerm from './use-search-term'

const hotkeys = ['/', 'ctrl + f']

const hotkeysMenu = (
  <Menu
    data={['Hotkeys', ...hotkeys.map(Kbd.text)]}
    render={<VscodeIcon name='search' slot='content-before' />}
  />
)

const Search = component(({children, ...props}) => {
  const ref = useRef()
  const searchTerm = useSearchTerm()
  const searchTermState = searchTerm.useValue()

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
          !searchTerm.isDefault(searchTermState) && !isWordChar(searchTermState)
        }
        placeholder='Search'
        value={searchTermState}
        {...props}>
        {hotkeysMenu}
        {React.Children.map(children, children => (
          <div slot='content-after'>{children}</div>
        ))}
      </Input>
    </Slot>
  )
})

export default component(({children, ...props}) => (
  <Search {...props}>
    <ColorPicker />
    {children}
  </Search>
))
