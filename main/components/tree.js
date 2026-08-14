import {isBoolean, isPlainObject} from '@sindresorhus/is'
import {
  VscodeIcon,
  VscodeTree,
  VscodeTreeItem
} from '@vscode-elements/react-elements'
import {castArray} from 'es-toolkit/compat'

import {component} from '../hocs'
import {useMemo} from '../hooks/use-memo'
import {isReactKey} from '../misc'
import {trigger} from '../misc/trigger'
import {Slot} from './slot'

const renderItems = data =>
  data.map(({id, ...props}) => {
    trigger.error(!isReactKey(id, false))

    return <Item key={id} {...props} />
  })

const normalizeData = data =>
  Iterator.from(castArray(data))
    .filter(isPlainObject)
    .map(({children, ...rest}) => ({
      children: normalizeData(children),
      ...rest
    }))
    .toArray()

const Item = component(({checked, children, label, ...props}) => (
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
))

export const Tree = Object.assign(
  component(({data, ...props}) => {
    data = useMemo(() => normalizeData(data), [data])

    return (
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
    )
  }),
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
