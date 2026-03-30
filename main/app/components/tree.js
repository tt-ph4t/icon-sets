import {
  VscodeIcon,
  VscodeTree,
  VscodeTreeItem
} from '@vscode-elements/react-elements'
import {asyncNoop} from 'es-toolkit'

import {component} from '../hocs'
import {hasValues, trigger} from '../misc'
import {EMPTY_ARRAY} from '../misc/constants'

const render = (data = EMPTY_ARRAY) =>
  data.map(({id, ...props}) => {
    trigger.error(!hasValues(id))

    return <Tree.Item key={id} {...props} />
  })

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
    },
    Item: component(({children, label, ...props}) => (
      <VscodeTreeItem
        // open // ?
        {...props}>
        {label}
        {render(children)}
      </VscodeTreeItem>
    ))
  }
)
