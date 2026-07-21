import {isString} from '@sindresorhus/is'
import {detectPlatform, formatForDisplay} from '@tanstack/react-hotkeys'
import {capitalCase} from 'change-case'
import {union} from 'es-toolkit'
import {castArray} from 'es-toolkit/compat'
import {sort} from 'fast-sort'

import {component} from '../hocs'
import {useMemo} from '../hooks/use-memo'
import {copy} from '../misc'
import {cache} from '../misc/cache'
import {Menu} from './menu'
import {ToolbarButton} from './toolbar-button'

const platform = detectPlatform()
const platforms = union([platform], sort(['mac', 'windows', 'linux']).asc())
const separator = '+'

export const Kbd = Object.assign(
  component(({keys, ...props}) => {
    const hotkey = useMemo(
      () => castArray(keys).filter(isString).join(separator),
      [keys]
    )

    return (
      <Menu
        data={platforms.flatMap(a => {
          const label = Kbd.text(hotkey, {
            platform: a
          })

          return [
            capitalCase(a),
            {
              checked: a === platform,
              label,
              onClick: async () => {
                await copy(label)
              }
            }
          ]
        })}
        render={<ToolbarButton {...props}>{Kbd.text(hotkey)}</ToolbarButton>}
      />
    )
  }),
  {
    text: cache((hotkey, options) =>
      formatForDisplay(hotkey, {
        platform,
        separatorToken: ` ${separator} `,
        useSymbols: false,
        ...options
      })
    )
  }
)
