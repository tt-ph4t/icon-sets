import { isEmptyString, isSymbol } from '@sindresorhus/is'
import { useQuery } from '@tanstack/react-query'
import { capitalCase } from 'change-case'
import { compact } from 'es-toolkit'

import { Menu } from '../../shared/components/base-ui/menu'
import { Collapsible } from '../../shared/components/collapsible'
import { IconGrid } from '../../shared/components/icon-grid'
import { ToolbarButton } from '../../shared/components/toolbar-button'
import { component, withImmerAtom } from '../../shared/hocs'
import { useCallback } from '../../shared/hooks/use-callback'
import { getId, getQueryOptions, isEqual } from '../../shared/utils'

const initialState = {
  category: Symbol(),
  theme: {
    prefix: Symbol(),
    suffix: Symbol()
  }
}

const useStore = withImmerAtom({ current: {} })

const matchesIconTheme = (icon, theme) =>
  isEmptyString(
    // https://iconify.design/docs/types/iconify-json-metadata.html#default-theme
    // https://github.com/search?q=repo%3Aiconify%2Ficon-sets+%22%22%3A&type=code
    theme.current
  )
    ? !compact(Object.keys(theme.list)).some(current =>
        matchesIconTheme(icon, { ...theme, current })
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

export default component(({ context }) => {
  const store = useStore()

  const state = store.useSelectValue(
    ({ draft }) => draft.current[context.id] ?? initialState,
    [context.id]
  )

  const query = useQuery(
    getQueryOptions({
      select: useCallback(iconSets => iconSets[context.id], [context.id]),
      url: import.meta.env.VITE_ICON_SETS_URL
    })
  )

  const isInitialState = isEqual(state, initialState)

  return (
    <Collapsible
      description={query.data.category}
      heading={`${context.index + 1}. ${query.data.name}`}
      keepMounted={false}
      {...context.CollapsibleProps}>
      <div style={{ height: 'var(--sidebar-icon-grid-height)' }}>
        <IconGrid
          iconIds={(isInitialState
            ? query.data.icons
            : query.data.icons.filter(
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
              )
          ).map(icon => getId(query.data.prefix, icon))}
        />
      </div>
      <Menu
        data={[
          {
            label: 'Category',
            menu: Object.keys(query.data.categories).map(category => {
              const selected = category === state.category

              return {
                label: category,
                onClick: () => {
                  store.set(({ draft }) => {
                    draft.current[context.id] = {
                      ...(draft.current[context.id] ?? initialState),
                      category: selected ? initialState.category : category
                    }
                  })
                },
                selected
              }
            })
          },
          { separator: true },
          ...[
            ['prefix', query.data.prefixes],
            ['suffix', query.data.suffixes]
          ].map(([a, b], index) => ({
            description: capitalCase(a),
            label: !index && 'Theme',
            menu: Object.entries(b).map(([c, d]) => {
              const selected = c === state.theme[a]

              return {
                label: d,
                onClick: () => {
                  store.set(({ draft }) => {
                    const state = draft.current[context.id] ?? initialState

                    draft.current[context.id] = {
                      ...state,
                      theme: {
                        ...state.theme,
                        [a]: selected ? initialState.theme[a] : c
                      }
                    }
                  })
                },
                selected
              }
            })
          }))
        ]}
        render={
          <ToolbarButton
            checked={!isInitialState}
            icon='filter'
            preventToggle
            slot='actions'
          />
        }
      />
    </Collapsible>
  )
})
