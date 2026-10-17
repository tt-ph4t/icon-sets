import {useIsFetching, useQueryClient} from '@tanstack/react-query'
import {VscodeToolbarContainer} from '@vscode-elements/react-elements'
import {useNetwork} from 'ahooks'
import {castArray} from 'es-toolkit/compat'

import {Devtools} from '../../components/devtools'
import {IconGrid} from '../../components/icon-grid'
import {Slot} from '../../components/slot'
import {ToolbarButton} from '../../components/toolbar-button'
import {component} from '../../hocs'
import {pluralize} from '../../misc/pluralize'
import PageContext from '../context'
import Layout from '../layout'
import AllIconQueries from './all-icon-queries'
import Cuelume from './cuelume'
import FailedQueries from './failed-queries'
import Font from './font'
import Fps from './fps'
import heldKeys from './held-keys'
import PrefetchIcons from './prefetch-icons'
import Settings from './settings'

useNetwork

const FetchingQueries = component(props => {
  const isFetching = Boolean(useIsFetching())

  const queries = useQueryClient()
    .getQueryCache()
    .findAll({
      predicate: query => query.state.fetchStatus === 'fetching'
    })

  return (
    isFetching && (
      <ToolbarButton {...props}>
        Fetching {pluralize(queries, 'query')}
      </ToolbarButton>
    )
  )
})

const PageRemount = component(props => {
  const {remount} = PageContext.useSelectValue('remount')

  return (
    <Slot onClick={remount}>
      <ToolbarButton icon={remount.icon} {...props} />
    </Slot>
  )
})

export default component(({menu}) => (
  <>
    <div
      style={{
        alignItems: 'flex-end',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--SPACING)'
      }}>
      {heldKeys}
      <FetchingQueries />
      <FailedQueries />
      <Fps />
      <VscodeToolbarContainer>
        <Settings menu={castArray(menu)} />
        <Layout.SidebarRightToggle />
        <Devtools.Toggle />
        <Cuelume />
        <IconGrid.Search>
          <PrefetchIcons.Actions />
          <AllIconQueries />
        </IconGrid.Search>
        <PageRemount />
      </VscodeToolbarContainer>
    </div>
    <Font.Sync />
    <PrefetchIcons />
  </>
))
