import { BookmarkIcon } from '@heroicons/react/24/outline'
import { EmptyState } from '@astryxdesign/core/EmptyState'
import { Button } from '@astryxdesign/core/Button'
import { Icon } from '@astryxdesign/core/Icon'
import { urlFor } from '~/client'

/**
 * The bookmarks list with nothing in it, offering a way to the Quran.
 */
export default function BookmarksEmpty() {
  return (
    <EmptyState
      headingLevel={2}
      icon={<Icon icon={BookmarkIcon} size="lg" />}
      title="You haven't bookmarked any ayahs yet"
      actions={<Button label="Read the Quran" variant="primary" href={urlFor('surahs.index')} />}
    />
  )
}
