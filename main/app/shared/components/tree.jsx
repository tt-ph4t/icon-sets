import {
  VscodeIcon,
  VscodeTree,
  VscodeTreeItem
} from '@vscode-elements/react-elements'
import { asyncNoop } from 'es-toolkit'

import { component } from '../hocs'

const render = (data = []) =>
  data.map(props => <Tree.Item key={props.id} {...props} />)

export const Tree = Object.assign(
  component(({ data, onVscTreeSelect, ...props }) => (
    <VscodeTree
      onVscTreeSelect={
        onVscTreeSelect ??
        (async event => {
          const { onClick = asyncNoop } = event.detail[0]._path.reduce(
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
    Item: component(({ children, label, ...props }) => (
      <VscodeTreeItem {...props}>
        {label}
        {render(children)}
      </VscodeTreeItem>
    ))
  }
)
