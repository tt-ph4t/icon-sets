import React from 'react'

import { component } from '../shared/hocs'
import BookmarkedIcons from './bookmarked-icons'
import CachedIcons from './cached-icons'
import CustomizedIcons from './customized-icons'
import IconSets from './icon-sets'

export default component(() => (
  <div style={{ '--sidebar-icon-grid-height': 'calc(var(--height) / 2)' }}>
    <React.Activity>
      <IconSets />
    </React.Activity>
    <BookmarkedIcons />
    <CustomizedIcons />
    <CachedIcons />
  </div>
))
