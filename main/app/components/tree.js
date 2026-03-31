import {isBoolean} from '@sindresorhus/is'
import {
  VscodeIcon,
  VscodeTree,
  VscodeTreeItem
} from '@vscode-elements/react-elements'
import {asyncNoop} from 'es-toolkit'
import React from 'react'

import {component} from '../hocs'
import {hasValues, trigger} from '../misc'
import {EMPTY_ARRAY} from '../misc/constants'

const render = (data = EMPTY_ARRAY) => (
  <React.Activity>
    {data.map(({id, ...props}) => {
      trigger.error(!hasValues(id))

      return <Item key={id} {...props} />
    })}
  </React.Activity>
)

const Item = component(({checked, children, label, ...props}) => (
  <VscodeTreeItem {...props}>
    {label}
    <React.Activity mode={isBoolean(checked) ? 'visible' : 'hidden'}>
      <VscodeIcon
        name={checked ? 'check' : 'blank'}
        size={14}
        slot='icon-leaf'
      />
    </React.Activity>
    {render(children)}
  </VscodeTreeItem>
))

export const Tree = Object.assign(
  component(({data = EMPTY_ARRAY, onVscTreeSelect, ...props}) => (
    <VscodeTree
      onVscTreeSelect={
        onVscTreeSelect ??
        (async event => {
          const {onClick = asyncNoop} = event.detail[0]._path.reduce(
            (a, b) => (a.children ?? a)[b],
            data
          )

          await onClick(event)
        })
      }
      {...props}>
      {render(data)}
    </VscodeTree>
  )),
  {
    icon: {
      branch: (
        <>
          <VscodeIcon name='folder' slot='icon-branch' />
          <VscodeIcon name='folder-opened' slot='icon-branch-opened' />
        </>
      ),
      leaf: <VscodeIcon name='file' slot='icon-leaf' />
    }
  }
)
