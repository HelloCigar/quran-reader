import { BookmarkIcon } from '@heroicons/react/24/outline'
import { useRouter } from '@adonisjs/inertia/react'
import { IconButton } from '@astryxdesign/core/IconButton'
import { Icon } from '@astryxdesign/core/Icon'
import { urlFor } from '~/client'

/**
 * The "not bookmarked" action on an ayah. Signed in, it bookmarks the ayah;
 * signed out, it links to sign-in carrying the ayah to bookmark afterwards.
 */
export default function BookmarkButton({
  surah,
  ayah,
  isSignedIn,
}: {
  surah: number
  ayah: number
  isSignedIn: boolean
}) {
  const router = useRouter()
  const label = `Bookmark ${surah}:${ayah}`
  const icon = <Icon icon={BookmarkIcon} />

  if (!isSignedIn) {
    return (
      <IconButton
        label={label}
        tooltip="Bookmark"
        variant="ghost"
        icon={icon}
        href={urlFor('session.create', [], { qs: { bookmark: { surah, ayah } } })}
      />
    )
  }

  return (
    <IconButton
      label={label}
      tooltip="Bookmark"
      variant="ghost"
      icon={icon}
      onClick={() =>
        // Only the bookmarks change, so the Ayahs loaded so far stay; the page
        // then asks for the note (the `noteFor` flash).
        router.post(
          { route: 'bookmarks.store' },
          { surah, ayah },
          { preserveScroll: true, preserveState: true, only: ['bookmarks'] }
        )
      }
    />
  )
}
