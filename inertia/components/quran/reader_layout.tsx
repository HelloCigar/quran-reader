import { type ReactNode } from 'react'
import { Layout, LayoutContent, LayoutPanel } from '@astryxdesign/core/Layout'
import type { Data } from '@generated/data'
import ReaderSidebar from '~/components/quran/reader_sidebar'
import ReaderSidebarDrawer from '~/components/quran/reader_sidebar_drawer'
import { useReaderSidebar } from '~/components/quran/use_reader_sidebar'

/**
 * The frame of the reading page, nested in the app layout: the sidebar (a
 * start panel, or a drawer on a phone) beside the page. Inertia keeps it
 * mounted from one Surah to the next, so an open drawer and the panel's
 * scroll survive opening a Surah. It reads the reading page's props:
 *
 * `Show.layout = [AppLayout, ReaderLayout]`
 */
export default function ReaderLayout({
  surah,
  surahs,
  children,
}: {
  surah: Data.Surah.Variants['forReading']
  surahs: Data.Surah.Variants['forNavigation'][]
  children: ReactNode
}) {
  const sidebar = useReaderSidebar()

  return (
    <>
      <Layout
        start={
          sidebar.hasPanel && (
            <LayoutPanel
              hasDivider
              width={380}
              padding={4}
              isScrollable={false}
              role="navigation"
              label="Quran"
            >
              <ReaderSidebar
                surahs={surahs}
                current={surah.number}
                mode={sidebar.mode}
                onModeChange={sidebar.setMode}
              />
            </LayoutPanel>
          )
        }
        content={
          <LayoutContent padding={0} isScrollable={false}>
            {children}
          </LayoutContent>
        }
      />
      <ReaderSidebarDrawer surahs={surahs} current={surah.number} />
    </>
  )
}
