import { type ReactNode } from 'react'
import {
  BackwardIcon,
  ForwardIcon,
  ListBulletIcon,
  PauseIcon,
  PlayIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid'
import { useAppShellMobile } from '@astryxdesign/core/AppShell'
import { Layout, LayoutContent, LayoutFooter } from '@astryxdesign/core/Layout'
import { HStack } from '@astryxdesign/core/HStack'
import { VStack } from '@astryxdesign/core/VStack'
import { StackItem } from '@astryxdesign/core/Stack'
import { IconButton } from '@astryxdesign/core/IconButton'
import { Icon } from '@astryxdesign/core/Icon'
import { Link } from '@astryxdesign/core/Link'
import { Toolbar } from '@astryxdesign/core/Toolbar'
import { ProgressBar } from '@astryxdesign/core/ProgressBar'
import { Text } from '@astryxdesign/core/Text'
import { urlFor } from '~/client'
import { useRecitation } from '~/components/quran/recitation'

/**
 * Every page of the app layout, with the Recitation bar pinned beneath it.
 * The bar is always there on a Surah's page, where its Play starts a
 * Recitation; on every other page it shows only while there is a Recitation.
 */
export default function RecitationFrame({ children }: { children: ReactNode }) {
  const { recited, readingPage } = useRecitation()
  const hasBar = recited !== null || readingPage !== null

  return (
    <Layout
      content={<LayoutContent padding={0}>{children}</LayoutContent>}
      footer={hasBar && <RecitationBar />}
    />
  )
}

/**
 * The Recitation's controls, and the Surah and Ayah Reference of the Recited
 * Ayah, which link to that Ayah.
 *
 * Responsive contract. Wide: one line, with the controls at the start, the
 * progress bar filling the middle, then the Surah and Ayah Reference and
 * Close. Phone (below AppShell's `md` breakpoint): the progress bar spans the
 * width on its own line, then the Surah and Ayah Reference, then the controls
 * in three lanes: the sidebar toggle, Previous Ayah, Play and Next Ayah, and
 * Close. The middle lane stays centered whether or not the side lanes have a
 * button (Close shows only once a Recitation has started).
 */
function RecitationBar() {
  const { recited, readingPage, isPlaying, isLoading, play, resume, pause, close } = useRecitation()
  const { isMobile } = useAppShellMobile()
  const recitation = recited?.recitation
  const recitedAyah = recitation?.ayahs.find(({ number }) => number === recited?.ayah)
  /** Another Surah's page is open: its Play starts that Surah's Recitation. */
  const isElsewhere = Boolean(
    recitation && readingPage && readingPage.surahNumber !== recitation.surahNumber
  )

  const onPlay = () => {
    if (recited && !isElsewhere) resume()
    else if (readingPage) play(readingPage.surahNumber, readingPage.firstAyahInView())
  }

  const sidebarToggle = readingPage?.sidebarToggle && (
    <IconButton
      label={readingPage.sidebarToggle.label}
      variant="ghost"
      icon={<Icon icon={ListBulletIcon} />}
      onClick={readingPage.sidebarToggle.onToggle}
    />
  )
  const playPause = isPlaying ? (
    <IconButton
      label="Pause Recitation"
      variant="primary"
      icon={<Icon icon={PauseIcon} />}
      onClick={pause}
    />
  ) : (
    <IconButton
      label="Play Recitation"
      variant="primary"
      icon={<Icon icon={PlayIcon} />}
      isLoading={isLoading}
      onClick={onPlay}
    />
  )
  const controls = (
    <HStack gap={2} vAlign="center">
      <MoveAyahButton direction="previous" />
      {playPause}
      <MoveAyahButton direction="next" />
    </HStack>
  )
  const progress = (
    <ProgressBar
      label="Recitation progress"
      isLabelHidden
      value={recitedAyah?.startMs ?? 0}
      max={recitation?.ayahs.at(-1)?.endMs ?? 1}
    />
  )
  const recitedLink = recitation && recitedAyah && (
    <Link
      href={urlFor(
        'surahs.show',
        { number: recitation.surahNumber },
        { qs: { ayah: recitedAyah.number } }
      )}
      color="secondary"
    >
      <HStack gap={2} vAlign="center">
        <Text type="supporting" color="inherit" maxLines={1}>
          {recitation.surahName}
        </Text>
        <Text type="supporting" color="inherit" data-testid="recited-ayah">
          {recitedAyah.reference}
        </Text>
      </HStack>
    </Link>
  )
  const closeButton = recited && (
    <IconButton
      label="Close Recitation"
      variant="ghost"
      icon={<Icon icon={XMarkIcon} />}
      onClick={close}
    />
  )

  return (
    <LayoutFooter role="region" label="Recitation" hasDivider>
      {isMobile ? (
        <VStack gap={2}>
          {progress}
          {recitedLink && <HStack hAlign="center">{recitedLink}</HStack>}
          <Toolbar
            label="Recitation controls"
            startContent={sidebarToggle}
            centerContent={controls}
            endContent={closeButton}
          />
        </VStack>
      ) : (
        <HStack gap={4} vAlign="center">
          <HStack gap={2} vAlign="center">
            {sidebarToggle}
            {controls}
          </HStack>
          <StackItem size="fill">{progress}</StackItem>
          {recitedLink}
          {closeButton}
        </HStack>
      )}
    </LayoutFooter>
  )
}

/**
 * Moves the Recitation to the start of the previous or next Ayah, and the
 * page of the Surah being recited with it; on any other page only the
 * Recitation moves. Disabled with no Recitation, and past either end of its
 * Surah.
 */
function MoveAyahButton({ direction }: { direction: 'previous' | 'next' }) {
  const { recited, readingPage, moveTo } = useRecitation()
  const lastAyah = recited?.recitation.ayahs.at(-1)?.number ?? 0
  const toAyah = recited && recited.ayah + (direction === 'previous' ? -1 : 1)
  const canMove = toAyah !== null && toAyah !== undefined && toAyah >= 1 && toAyah <= lastAyah
  const label = direction === 'previous' ? 'Previous Ayah' : 'Next Ayah'

  const onClick = () => {
    if (!canMove) return
    moveTo(toAyah)
    if (readingPage?.surahNumber === recited?.recitation.surahNumber) readingPage?.showAyah(toAyah)
  }

  return (
    <IconButton
      label={label}
      tooltip={label}
      variant="ghost"
      icon={<Icon icon={direction === 'previous' ? BackwardIcon : ForwardIcon} />}
      isDisabled={!canMove}
      onClick={onClick}
    />
  )
}
