import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
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
import { Slider } from '@astryxdesign/core/Slider'
import { Text } from '@astryxdesign/core/Text'
import { urlFor } from '~/client'
import {
  useRecitation,
  useRecitationPosition,
  type ReadingPage,
  type Recited,
} from '~/components/quran/recitation'

/** The keys that move a slider's thumb. */
const SLIDER_KEYS = new Set([
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'PageUp',
  'PageDown',
  'Home',
  'End',
])

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
 * progress bar filling the middle, then the elapsed and total time, the Surah
 * and Ayah Reference and Close. Phones show no times. Phone (below AppShell's `md` breakpoint): the progress bar spans the
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
  const progress = recited ? (
    <RecitedProgress recited={recited} />
  ) : (
    readingPage && <UnstartedProgress page={readingPage} />
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
          {recited && <RecitationTime recited={recited} />}
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

/**
 * How far the Recitation has got through its Surah, as time in the Surah's
 * audio file (see ADR 0002), and a slider to move through it.
 *
 * - While the reader drags, the Recitation plays on and the thumb shows the
 *   Ayah Reference under it. Letting go plays from the start of the Word
 *   under the thumb, never from partway through one, and the page of the
 *   Surah being recited shows its Ayah and follows again.
 * - Left and Right move one Ayah, Home and End go to the first and last;
 *   each lands at the start of the Ayah.
 */
function RecitedProgress({ recited }: { recited: Recited }) {
  const { readingPage, playAt, playAtWord } = useRecitation()
  const [position, readPosition] = useRecitationPosition()
  const positionMs = Math.floor(position)
  /** Where the reader holds the thumb, in ms; `null` when they don't. */
  const [draggedMs, setDraggedMs] = useState<number | null>(null)
  /** Whether a key, not a drag, is moving the thumb. */
  const isKeyRef = useRef(false)
  const { ayahs, surahNumber } = recited.recitation
  const endMs = ayahs.at(-1)?.endMs ?? 1
  const lastAyah = ayahs.at(-1)?.number ?? 1
  /**
   * The Ayah heard at `ms`. A first Word can begin a little before its Ayah
   * (see ADR 0002): the Ayah counts from whichever is first, so the thumb,
   * the Word played and the page agree.
   */
  const ayahAt = (ms: number) =>
    ayahs.findLast((ayah) => Math.min(ayah.startMs, ayah.words[0]?.startMs ?? Infinity) <= ms) ??
    ayahs[0]
  const valueMs = draggedMs ?? Math.min(positionMs, endMs)

  const onKeyDownCapture = (event: KeyboardEvent) => {
    if (SLIDER_KEYS.has(event.key)) isKeyRef.current = true
  }
  /**
   * A key moves the thumb one step of time, which says only which way to go:
   * to either end of the Surah, or one Ayah on or back.
   */
  const ayahMovedTo = (toMs: number) => {
    if (toMs <= 0) return 1
    if (toMs >= endMs) return lastAyah
    return Math.min(Math.max(recited.ayah + (toMs > valueMs ? 1 : -1), 1), lastAyah)
  }
  const onChangeEnd = (toMs: number) => {
    const isKey = isKeyRef.current
    isKeyRef.current = false
    setDraggedMs(null)
    const ayah = ayahAt(toMs)
    /** The Word under the thumb: the last one of that Ayah to have started. */
    const word = ayah?.words.findLast(({ startMs }) => startMs <= toMs)
    const toAyah = isKey ? ayahMovedTo(toMs) : (ayah?.number ?? 1)
    if (!isKey && word) playAtWord(word.location)
    else playAt(toAyah)
    // With the thumb let go in the same render, so it never shows the place the Recitation left.
    readPosition()
    if (readingPage?.surahNumber === surahNumber) readingPage.showAyah(toAyah)
  }
  /** What the thumb shows and reads out: `Ayah 2:255`. */
  const thumbText = (ms: number) => {
    const ayah =
      draggedMs === null ? ayahs.find(({ number }) => number === recited.ayah) : ayahAt(ms)
    return `Ayah ${ayah?.reference ?? ''}`
  }

  return (
    <Slider
      label="Recitation progress"
      isLabelHidden
      min={0}
      max={endMs}
      value={valueMs}
      formatValue={thumbText}
      onChange={setDraggedMs}
      onChangeEnd={onChangeEnd}
      onKeyDownCapture={onKeyDownCapture}
    />
  )
}

/**
 * The progress bar before a Recitation has started: its Recitation isn't
 * loaded, so it counts in Ayahs and sits at the first Ayah in view. Letting
 * go of the thumb, or a key, loads the Recitation and plays from that Ayah.
 */
function UnstartedProgress({ page }: { page: ReadingPage }) {
  const { play } = useRecitation()
  const [firstInView, setFirstInView] = useState(1)
  const [dragged, setDragged] = useState<number | null>(null)

  useEffect(() => {
    let frame = 0
    const measure = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        setFirstInView(page.firstAyahInView())
      })
    }
    measure()
    // The Ayahs scroll in a region of the page: scroll events reach the document only while captured.
    const options = { capture: true, passive: true }
    document.addEventListener('scroll', measure, options)
    return () => {
      document.removeEventListener('scroll', measure, { capture: true })
      cancelAnimationFrame(frame)
    }
  }, [page])

  const onChangeEnd = (ayah: number) => {
    setDragged(null)
    play(page.surahNumber, ayah)
    page.showAyah(ayah)
  }

  return (
    <Slider
      label="Recitation progress"
      isLabelHidden
      min={1}
      max={page.ayahCount}
      value={dragged ?? firstInView}
      formatValue={(ayah) => `Ayah ${page.surahNumber}:${ayah}`}
      onChange={setDragged}
      onChangeEnd={onChangeEnd}
    />
  )
}

/** The elapsed and total time of the Recitation, e.g. `3:12 / 1:58:40`. */
function RecitationTime({ recited }: { recited: Recited }) {
  const [positionMs] = useRecitationPosition()
  const endMs = recited.recitation.ayahs.at(-1)?.endMs ?? 0

  return (
    <Text type="supporting" hasTabularNumbers textWrap="nowrap" data-testid="recitation-time">
      {clockTime(Math.min(positionMs, endMs))} / {clockTime(endMs)}
    </Text>
  )
}

// flow-allow flow-response-design: "Format each value that a person reads in
// the transformer". The elapsed time changes every second as the audio plays
// in the browser, so no transformer sees it; the total is written the same
// way beside it.
/** `ms` as `m:ss`, or `h:mm:ss` from an hour up. */
function clockTime(ms: number) {
  const seconds = Math.floor(ms / 1000)
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const ss = String(seconds % 60).padStart(2, '0')
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, '0')}:${ss}` : `${minutes}:${ss}`
}
