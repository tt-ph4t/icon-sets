import {isBoolean} from '@sindresorhus/is'
import {
  VscodeIcon,
  VscodeTree,
  VscodeTreeItem
} from '@vscode-elements/react-elements'
import React from 'react'

import {component} from '../hocs'
import {isReactKey, trigger} from '../misc'
import {EMPTY} from '../misc/constants'

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
      <Item.List data={children} />
    </VscodeTreeItem>
  )),
  {
    List: component(({data = EMPTY.ARRAY}) =>
      data.map(({id, ...props}) => {
        trigger.error(!isReactKey(id, false))

        return <Item key={id} {...props} />
      })
    )
  }
)

export const Tree = Object.assign(
  component(
    ({
      data = EMPTY.ARRAY,
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
          (async (...args) => {
            const [
              {
                detail: [item]
              }
            ] = args

            await item._path
              .reduce((a, b) => (a.children ?? a)[b], data)
              .onClick?.(...args)

            if (item.branch) item.open // ? useStore
          })
        }
        {...props}>
        <Item.List data={data} />
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
