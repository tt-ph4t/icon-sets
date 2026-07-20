import {isBoolean} from '@sindresorhus/is'
import {
  VscodeIcon,
  VscodeTree,
  VscodeTreeItem
} from '@vscode-elements/react-elements'

import {component} from '../hocs'
import {isReactKey} from '../misc'
import {EMPTY} from '../misc/constants'
import {trigger} from '../misc/trigger'
import {Slot} from './slot'

const renderItems = (data = EMPTY.ARRAY) =>
  data.map(({id, ...props}) => {
    trigger.error(!isReactKey(id, false))

    return <Item key={id} {...props} />
  })

const Item = component(({checked, children, label, ...props}) => (
  <Slot.Interactive>
    <VscodeTreeItem {...props}>
      {label}
      {isBoolean(checked) && (
        <VscodeIcon
          name={checked ? 'check' : 'blank'}
          size={14}
          slot='icon-leaf'
        />
      )}
      {renderItems(children)}
    </VscodeTreeItem>
  </Slot.Interactive>
))

export const Tree = Object.assign(
  component(({data = EMPTY.ARRAY, ...props}) => (
    <Slot
      onVscTreeSelect={async (...args) => {
        const [
          {
            detail: [item]
          }
        ] = args

        await item._path
          .reduce((a, b) => (a.children ?? a)[b], data)
          .onClick?.(...args)

        if (item.branch) item.open // ? useStore
      }}>
      <VscodeTree hideArrows indentGuides='always' {...props}>
        {renderItems(data)}
      </VscodeTree>
    </Slot>
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
