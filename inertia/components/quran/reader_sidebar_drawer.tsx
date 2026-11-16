import { type ReactNode } from 'react'
import { usePage } from '@inertiajs/react'
import { Drawer } from '@astryxdesign/core/Drawer'
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
 * The sidebar in a drawer, from the start, with `current` marked.
 * `ReaderLayout` renders it on a Surah's page, and
 * `OffPageSidebarDrawer` on every other page; both share the one open state
 * and mode, so a drawer open as the reader goes to a Surah stays open.
 */
export default function ReaderSidebarDrawer({
  surahs,
  current,
}: {
  surahs: Data.Surah.Variants['forNavigation'][]
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
      <ReaderSidebar
        surahs={surahs}
        current={current}
        mode={sidebar.mode}
        onModeChange={sidebar.setMode}
        onClose={close}
      />
    </Drawer>
  )
}

/**
 * The drawer off a Surah's page, set to the Surah being recited: the app
 * layout renders it under every page, and it shows while a Recitation does.
 *
 * It lists the Surahs the client keeps from the Surah's page where the
 * Recitation began.
 */
export function OffPageSidebarDrawer() {
  const { sidebarSurahs } = usePage().props
  const { readingPage, recited } = useRecitation()
  if (readingPage || !recited || !sidebarSurahs) return null

  return <ReaderSidebarDrawer surahs={sidebarSurahs} current={recited.recitation.surahNumber} />
}
