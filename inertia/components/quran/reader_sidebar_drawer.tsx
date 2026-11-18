import * as stylex from '@stylexjs/stylex'
import { type ReactNode } from 'react'
import { usePage } from '@inertiajs/react'
import { Drawer } from '@astryxdesign/core/Drawer'
import {
  colorVars,
  radiusVars,
  shadowVars,
  spacingVars,
} from '@astryxdesign/core/theme/tokens.stylex'
import type { Data } from '@generated/data'
import ReaderSidebar from '~/components/quran/reader_sidebar'
import { useRecitation } from '~/components/quran/recitation'
import {
  ReaderSidebarContext,
  useReaderSidebar,
  useReaderSidebarState,
} from '~/components/quran/use_reader_sidebar'

/** 400px, or the screen less the drawer's 12px margins on both sides, if that is narrower. */
const DRAWER_WIDTH = `min(25rem, calc(100vw - 2 * ${spacingVars['--spacing-3']}))`

/** The drawer floats 12px in from the screen's edges, in a white card with soft 24px corners. */
const styles = stylex.create({
  drawer: {
    insetBlock: spacingVars['--spacing-3'],
    insetInlineStart: spacingVars['--spacing-3'],
    height: 'auto',
    maxWidth: 'none',
    width: DRAWER_WIDTH,
    borderRadius: `calc(${radiusVars['--radius-page']} + ${spacingVars['--spacing-1']})`,
    backgroundColor: colorVars['--color-background-card'],
    // The drawer's content area paints the surface colour; here it is the card's.
    '--color-background-surface': colorVars['--color-background-card'],
    boxShadow: shadowVars['--shadow-high'],
    '::backdrop': {
      backgroundColor: `color-mix(in srgb, ${colorVars['--color-text-primary']} 32%, transparent)`,
    },
  },
})

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
      width={DRAWER_WIDTH}
      label="Quran"
      xstyle={styles.drawer}
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
