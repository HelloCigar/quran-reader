import { useEffect, useEffectEvent, type ReactNode } from 'react'
import { usePage } from '@inertiajs/react'
import { useRouter } from '@adonisjs/inertia/react'
import { Drawer } from '@astryxdesign/core/Drawer'
import { HStack } from '@astryxdesign/core/HStack'
import { Spinner } from '@astryxdesign/core/Spinner'
import { Text } from '@astryxdesign/core/Text'
import type { Data } from '@generated/data'
import ReaderSidebar from '~/components/quran/reader_sidebar'
import { useRecitation } from '~/components/quran/recitation'
import {
  ReaderSidebarContext,
  useReaderSidebar,
  useReaderSidebarState,
} from '~/components/quran/use_reader_sidebar'

/** Holds the Surah and Ayah sidebar for every page inside the app layout. */
export function ReaderSidebarProvider({ children }: { children: ReactNode }) {
  const sidebar = useReaderSidebarState()

  return <ReaderSidebarContext value={sidebar}>{children}</ReaderSidebarContext>
}

/**
 * The sidebar in a drawer, from the start, with `current` marked. It waits
 * for the Surahs while they load (`undefined`), and says when they are
 * unavailable (`null`). `ReaderLayout` renders it on a Surah's page, and
 * `OffPageSidebarDrawer` on every other page; both share the one open state
 * and mode, so a drawer open as the reader goes to a Surah stays open.
 */
export default function ReaderSidebarDrawer({
  surahs,
  current,
}: {
  surahs: Data.Surah.Variants['forNavigation'][] | null | undefined
  current: number
}) {
  const sidebar = useReaderSidebar()
  const close = () => sidebar.setDrawerOpen(false)

  return (
    <Drawer
      isOpen={sidebar.isDrawerOpen}
      onOpenChange={sidebar.setDrawerOpen}
      side="start"
      width={420}
      experimental={{ isFullWidthOnMobile: true }}
      label="Quran"
    >
      {surahs ? (
        <ReaderSidebar
          surahs={surahs}
          current={current}
          mode={sidebar.mode}
          onModeChange={sidebar.setMode}
          onClose={close}
        />
      ) : (
        <HStack hAlign="center" padding={4}>
          {surahs === null ? (
            <Text type="supporting">The Surahs are unavailable right now.</Text>
          ) : (
            <Spinner aria-label="Loading surahs" />
          )}
        </HStack>
      )}
    </Drawer>
  )
}

/**
 * The drawer off a Surah's page, set to the Surah being recited: the app
 * layout renders it under every page, and it shows while a Recitation does.
 *
 * It loads the Surahs (the shared `sidebarSurahs`) the first time it opens,
 * so the pages that never open it don't pay for them, and tries again on the
 * next open when they were unavailable.
 */
export function OffPageSidebarDrawer() {
  const { props } = usePage()
  const router = useRouter()
  const { isDrawerOpen } = useReaderSidebar()
  const { readingPage, recited } = useRecitation()
  const isShown = !readingPage && recited !== null
  const needsSurahs = isShown && isDrawerOpen && !props.sidebarSurahs
  const loadSurahs = useEffectEvent(() => {
    // Async, so the drawer doesn't take it for a visit that closes it.
    router.visit(
      { href: window.location.href },
      {
        only: ['sidebarSurahs'],
        async: true,
        preserveState: true,
        preserveScroll: true,
        replace: true,
      }
    )
  })
  useEffect(() => {
    if (needsSurahs) loadSurahs()
  }, [needsSurahs])
  if (!isShown) return null

  return (
    <ReaderSidebarDrawer surahs={props.sidebarSurahs} current={recited.recitation.surahNumber} />
  )
}
