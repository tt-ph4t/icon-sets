import {isBoolean} from '@sindresorhus/is'
import {
  VscodeIcon,
  VscodeTree,
  VscodeTreeItem
} from '@vscode-elements/react-elements'
import {asyncNoop} from 'es-toolkit'
import React from 'react'

import {component} from '../hocs'
import {isReactKey, trigger} from '../misc'
import {EMPTY_ARRAY} from '../misc/constants'

const Item = Object.assign(
  component(({checked, children, label, ...props}) => (
    <VscodeTreeItem {...props}>
      {label}
      <React.Activity mode={isBoolean(checked) ? 'visible' : 'hidden'}>
        <VscodeIcon
          name={checked ? 'check' : 'blank'}
          size={14}
          slot='icon-leaf'
        />
      </React.Activity>
      {Item.renderChildren(children)}
    </VscodeTreeItem>
  )),
  {
    renderChildren: (data = EMPTY_ARRAY) => (
      <React.Activity>
        {data.map(({id, ...props}) => {
          trigger.error(!isReactKey(id, false))

          return <Item key={id} {...props} />
        })}
      </React.Activity>
    )
  }
)

export const Tree = Object.assign(
  component(
    ({
      data = EMPTY_ARRAY,
      hideArrows = true,
      indentGuides = 'always',
      onVscTreeSelect,
      ...props
    }) => (
      <VscodeTree
        hideArrows={hideArrows}
        indentGuides={indentGuides}
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
        {Item.renderChildren(data)}
      </VscodeTree>
    )
  ),
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
