import {isEmptyString, isSymbol} from '@sindresorhus/is'
import {useQuery} from '@tanstack/react-query'
import {isEqual} from '@ver0/deep-equal'
import {VscodeToolbarContainer} from '@vscode-elements/react-elements'
import {compact} from 'es-toolkit'
import {filter, map, pipe, take} from 'es-toolkit/fp'

import {Collapsible} from '../../../components/collapsible'
import {IconGrid} from '../../../components/icon-grid'
import {Menu} from '../../../components/menu'
import {ToolbarButton} from '../../../components/toolbar-button'
import {component} from '../../../hocs'
import {useCallback} from '../../../hooks/use-callback'
import {DEFAULT_QUERY_OPTIONS} from '../../../misc/constants'
import {getId} from '../../../misc/get-id'
import {pluralize} from '../../../misc/pluralize'
import {withImmerAtom} from '../../../misc/with-immer-atom'

const initialState = {
  category: Symbol(),
  theme: {
    prefix: Symbol(),
    suffix: Symbol()
  }
}

const useStore = withImmerAtom()

const matchesIconTheme = (icon, theme) =>
  isEmptyString(
    // https://iconify.design/docs/types/iconify-json-metadata.html#default-theme
    // https://github.com/search?q=repo%3Aiconify%2Ficon-sets+%22%22%3A&type=code
    theme.current
  )
    ? !compact(Object.keys(theme.list)).some(current =>
        matchesIconTheme(icon, {...theme, current})
      )
    : icon[
        {
          prefix: 'startsWith',
          suffix: 'endsWith'
        }[theme.match]
      ](
        {
          prefix: `${theme.current}-`,
          suffix: `-${theme.current}`
        }[theme.match]
      )

export default component(({context, prefix}) => {
  const store = useStore()

  const state = store.useSelectValue(
    ({draft}) => draft[prefix] ?? initialState,
    {
      deps: [prefix]
    }
  )

  const query = useQuery({
    ...DEFAULT_QUERY_OPTIONS,
    select: useCallback(iconSets => iconSets[prefix], [prefix])
  })

  const isInitialState = isEqual(state, initialState)

  return (
    <Collapsible
      description={query.data.category}
      heading={`${context.index + 1}. ${query.data.name}`}
      {...context.CollapsibleProps}>
      <div
        style={{
          height: 'var(--SIDEBAR-CONTENT-HEIGHT)'
        }}>
        <IconGrid
          iconIds={pipe(
            query.data.icons,
            isInitialState
              ? take(Infinity)
              : filter(
                  icon =>
                    (isSymbol(state.category) ||
                      query.data.categories[state.category]?.includes(icon)) &&
                    (isSymbol(state.theme.prefix) ||
                      matchesIconTheme(icon, {
                        current: state.theme.prefix,
                        list: query.data.prefixes,
                        match: 'prefix'
                      })) &&
                    (isSymbol(state.theme.suffix) ||
                      matchesIconTheme(icon, {
                        current: state.theme.suffix,
                        list: query.data.suffixes,
                        match: 'suffix'
                      }))
                ),
            map(icon => getId(query.data.prefix, icon))
          )}
        />
      </div>
      <VscodeToolbarContainer slot='actions'>
        <Menu
          data={[
            {
              label: 'Reset',
              onClick: () => {
                store.set(({draft}) => {
                  delete draft[prefix]
                })
              }
            },
            {
              separator: true
            },
            {
              label: pluralize(query.data.categories, 'category'),
              menu: Object.keys(query.data.categories).map(category => {
                const checked = category === state.category

                return {
                  checked,
                  label: category,
                  onClick: () => {
                    store.set(({draft}) => {
                      draft[prefix] = {
                        ...(draft[prefix] ?? initialState),
                        category: checked ? initialState.category : category
                      }
                    })
                  }
                }
              })
            },
            'Themes',
            ...[
              ['prefix', query.data.prefixes],
              ['suffix', query.data.suffixes]
            ].map(([a, b]) => ({
              label: pluralize(b, a),
              menu: Object.entries(b).map(([c, d]) => {
                const checked = c === state.theme[a]

                return {
                  checked,
                  label: d,
                  onClick: () => {
                    store.set(({draft}) => {
                      const state = draft[prefix] ?? initialState

                      draft[prefix] = {
                        ...state,
                        theme: {
                          ...state.theme,
                          [a]: checked ? initialState.theme[a] : c
                        }
                      }
                    })
                  }
                }
              })
            }))
          ]}
          render={
            <ToolbarButton checked={!isInitialState} controlled icon='filter' />
          }
        />
      </VscodeToolbarContainer>
    </Collapsible>
  )
})
