import * as stylex from '@stylexjs/stylex'
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
import {
  borderVars,
  colorVars,
  durationVars,
  radiusVars,
  shadowVars,
  spacingVars,
} from '@astryxdesign/core/theme/tokens.stylex'
import { urlFor } from '~/client'
import {
  useRecitation,
  useRecitationPosition,
  type ReadingPage,
  type Recited,
} from '~/components/quran/recitation'
import { useReaderSidebar } from '~/components/quran/use_reader_sidebar'

/**
 * How many places the thumb of the progress bar takes along its track. The
 * bar renders when the Recitation reaches the next one, not every frame: a
 * long Surah moves the thumb less than a pixel a second.
 */
const THUMB_PLACES = 1000

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

/** The widest the bar gets on a wide screen, in px. */
const BAR_WIDTH = 820

const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)'

/** The bar comes up from below as it appears. */
const rise = stylex.keyframes({
  from: { opacity: 0, transform: `translateY(${spacingVars['--spacing-7']}) scale(0.94)` },
  to: { opacity: 1, transform: 'none' },
})

/** Play and Pause turn into each other. */
const turnIn = stylex.keyframes({
  from: { opacity: 0, transform: 'scale(0.5) rotate(-25deg)' },
  to: { opacity: 1, transform: 'none' },
})

/** The ring around Pause while the Recitation plays. */
const pulse = stylex.keyframes({
  '0%': {
    boxShadow: `0 0 0 0 color-mix(in srgb, ${colorVars['--color-accent']} 30%, transparent)`,
  },
  '50%': {
    boxShadow: `0 0 0 ${spacingVars['--spacing-1-5']} color-mix(in srgb, ${colorVars['--color-accent']} 0%, transparent)`,
  },
  '100%': {
    boxShadow: `0 0 0 0 color-mix(in srgb, ${colorVars['--color-accent']} 0%, transparent)`,
  },
})

/** One bar of the playing indicator. */
const bounce = stylex.keyframes({
  '0%': { transform: 'scaleY(0.3)' },
  '50%': { transform: 'scaleY(1)' },
  '100%': { transform: 'scaleY(0.3)' },
})

const styles = stylex.create({
  /** The band the bar floats in: the page's own background shows around the bar. */
  band: {
    paddingBlockStart: spacingVars['--spacing-1'],
    paddingBlockEnd: spacingVars['--spacing-5'],
    paddingInline: spacingVars['--spacing-4'],
  },
  /** 10px from the sides and 14px from the bottom of the screen. */
  phoneBand: {
    paddingBlockEnd: `calc(${spacingVars['--spacing-3']} + ${spacingVars['--spacing-0-5']})`,
    paddingInline: `calc(${spacingVars['--spacing-2']} + ${spacingVars['--spacing-0-5']})`,
  },
  bar: {
    boxSizing: 'border-box',
    backgroundColor: colorVars['--color-background-card'],
    borderRadius: radiusVars['--radius-full'],
    boxShadow: `0 0 0 ${borderVars['--border-width']} ${colorVars['--color-border']}, ${shadowVars['--shadow-high']}`,
    paddingBlock: spacingVars['--spacing-2'],
    paddingInlineStart: spacingVars['--spacing-2'],
    paddingInlineEnd: spacingVars['--spacing-3'],
    animationName: { default: rise, [REDUCED_MOTION]: 'none' },
    animationDuration: durationVars['--duration-slow-min'],
    animationTimingFunction: 'cubic-bezier(0.2, 0.9, 0.25, 1.05)',
    animationFillMode: 'both',
  },
  /** A 64px card: 10px above and below the 44px controls, 22px corners. */
  phoneBar: {
    position: 'relative',
    borderRadius: `calc(${radiusVars['--radius-page']} + ${spacingVars['--spacing-0-5']})`,
    paddingBlock: `calc(${spacingVars['--spacing-2']} + ${spacingVars['--spacing-0-5']})`,
    paddingInlineStart: spacingVars['--spacing-1-5'],
    paddingInlineEnd: spacingVars['--spacing-2'],
  },
  /** Lets the Surah's name truncate instead of pushing the controls out. */
  shrinks: { minWidth: 0 },
  fixed: { flexShrink: 0 },
  /**
   * A toolbar pads itself for a place of its own under a header. Here it sits
   * in the bar's padding, so its own is pulled back in.
   */
  toolbar: {
    flexShrink: 0,
    marginBlock: `calc(-1 * ${spacingVars['--spacing-2']})`,
    marginInline: `calc(-1 * ${spacingVars['--spacing-2']})`,
  },
  /**
   * The phone's progress bar: a line along the card's bottom edge, 18px in
   * from each side, taking no row of its own. The slider's box is taller
   * than its line, which runs through its middle: the box hangs below the
   * card so the line sits just inside the edge.
   */
  phoneProgress: {
    position: 'absolute',
    insetInline: `calc(${spacingVars['--spacing-4']} + ${spacingVars['--spacing-0-5']})`,
    insetBlockEnd: `calc(-1 * ${spacingVars['--spacing-2']})`,
  },
  ghost: {
    width: spacingVars['--spacing-10'],
    height: spacingVars['--spacing-10'],
    borderRadius: radiusVars['--radius-full'],
    flexShrink: 0,
    transform: {
      default: 'scale(1)',
      ':active:not([aria-disabled="true"])': {
        default: 'scale(0.88)',
        [REDUCED_MOTION]: 'scale(1)',
      },
    },
  },
  play: {
    width: spacingVars['--spacing-11'],
    height: spacingVars['--spacing-11'],
    borderRadius: radiusVars['--radius-full'],
    flexShrink: 0,
    transform: {
      default: 'scale(1)',
      ':hover': {
        default: 'scale(1)',
        '@media (hover: hover) and (prefers-reduced-motion: no-preference)': 'scale(1.07)',
      },
      ':active': { default: 'scale(0.9)', [REDUCED_MOTION]: 'scale(1)' },
    },
  },
  /** The ring is the button's own shadow; its focus ring is an outline, so both can show. */
  playing: {
    animationName: { default: pulse, [REDUCED_MOTION]: 'none' },
    animationDuration: '2.4s',
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
  },
  glyph: {
    animationName: { default: turnIn, [REDUCED_MOTION]: 'none' },
    animationDuration: durationVars['--duration-medium-min'],
    animationTimingFunction: 'cubic-bezier(0.34, 1.5, 0.5, 1)',
    animationFillMode: 'both',
  },
  /** On a phone the indicator stands 10px in from the card's edge and 10px from the name. */
  phoneLink: {
    columnGap: `calc(${spacingVars['--spacing-2']} + ${spacingVars['--spacing-0-5']})`,
    paddingInlineStart: `calc(${spacingVars['--spacing-2']} + ${spacingVars['--spacing-0-5']})`,
  },
  indicator: { height: spacingVars['--spacing-3'], flexShrink: 0 },
  indicatorBar: {
    width: spacingVars['--spacing-0-5'],
    height: spacingVars['--spacing-3'],
    borderRadius: radiusVars['--radius-full'],
    backgroundColor: colorVars['--color-accent'],
    transformOrigin: 'bottom',
    transform: 'scaleY(0.3)',
    transitionProperty: 'transform',
    transitionDuration: { default: durationVars['--duration-fast'], [REDUCED_MOTION]: '0s' },
  },
  indicatorBarPlaying: {
    animationName: { default: bounce, [REDUCED_MOTION]: 'none' },
    animationDuration: '1s',
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
  },
  /** Paused, the bars rest at uneven heights, so they still read as bars and not dots. */
  indicatorBarFirst: { transform: 'scaleY(0.45)' },
  indicatorBarSecond: { transform: 'scaleY(0.85)', animationDelay: '-0.35s' },
  indicatorBarThird: { transform: 'scaleY(0.6)', animationDelay: '-0.7s' },
})

const INDICATOR_BARS = [
  styles.indicatorBarFirst,
  styles.indicatorBarSecond,
  styles.indicatorBarThird,
]

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
 * The bar is a rounded card that floats in the footer of the frame, which has
 * no background or divider of its own, so the page shows around the bar. The
 * page still ends above the footer: the region the Ayahs scroll in never runs
 * under the bar, so no Ayah or Recited Word hides behind it.
 *
 * Responsive contract. Wide: one line in a pill, capped at `BAR_WIDTH` and
 * centered: the sidebar toggle, Previous Ayah, Play and Next Ayah, then the
 * playing indicator with the Surah and Ayah Reference, the progress bar
 * filling the rest, the elapsed and total time, and Close. Phone (below
 * AppShell's `md` breakpoint): one card across the width. Its line has the
 * playing indicator with the Surah over the Ayah Reference, which takes the
 * room left, then the controls: the sidebar toggle, Previous Ayah, Play, Next
 * Ayah and Close. The progress bar is a thin line under that line. Phones
 * show no times. Close shows only once a Recitation has started.
 *
 * Motion, all of it off under `prefers-reduced-motion`: the bar rises as it
 * appears, Play and Pause turn into each other, Pause has a pulsing ring, the
 * indicator's bars move while the Recitation plays and rest low while it is
 * paused, and a button shrinks a little while pressed.
 */
function RecitationBar() {
  const { recited, readingPage, close } = useRecitation()
  const { isMobile } = useAppShellMobile()
  const { toggle } = useReaderSidebar()

  /** On a Surah's page it shows or hides the sidebar; elsewhere it opens it on the Surah recited. */
  const sidebarToggle = (
    <IconButton
      label={toggle.label}
      variant="ghost"
      icon={<Icon icon={ListBulletIcon} />}
      onClick={toggle.onToggle}
      xstyle={styles.ghost}
    />
  )
  const controls = (
    <HStack gap={0.5} vAlign="center" xstyle={styles.fixed}>
      <MoveAyahButton direction="previous" />
      <PlayPauseButton />
      <MoveAyahButton direction="next" />
    </HStack>
  )
  const progress = recited ? (
    <RecitedProgress recited={recited} />
  ) : (
    readingPage && <UnstartedProgress page={readingPage} />
  )
  const closeButton = recited && (
    <IconButton
      label="Close Recitation"
      variant="ghost"
      icon={<Icon icon={XMarkIcon} />}
      onClick={close}
      xstyle={styles.ghost}
    />
  )

  return (
    <LayoutFooter role="region" label="Recitation" padding={0}>
      <HStack hAlign="center" xstyle={[styles.band, isMobile && styles.phoneBand]}>
        {isMobile ? (
          <VStack width="100%" xstyle={[styles.bar, styles.phoneBar]}>
            <HStack gap={1} vAlign="center">
              <StackItem size="fill" xstyle={styles.shrinks}>
                <NowLabel />
              </StackItem>
              <Toolbar
                label="Recitation controls"
                gap={0.5}
                xstyle={styles.toolbar}
                startContent={
                  <>
                    {sidebarToggle}
                    {controls}
                    {closeButton}
                  </>
                }
              />
            </HStack>
            <StackItem xstyle={styles.phoneProgress}>{progress}</StackItem>
          </VStack>
        ) : (
          <HStack gap={3} vAlign="center" width="100%" maxWidth={BAR_WIDTH} xstyle={styles.bar}>
            <HStack gap={0.5} vAlign="center" xstyle={styles.fixed}>
              {sidebarToggle}
              {controls}
            </HStack>
            <NowLabel />
            <StackItem size="fill">{progress}</StackItem>
            {recited && <RecitationTime recited={recited} />}
            {closeButton}
          </HStack>
        )}
      </HStack>
    </LayoutFooter>
  )
}

/**
 * Play, or Pause while the Recitation plays. Play resumes the Recitation; on
 * another Surah's page, or before any Recitation, it starts that page's Surah
 * from the first Ayah in view. The icon's key makes it a new element on each
 * change, so it turns in again.
 */
function PlayPauseButton() {
  const { recited, readingPage, isPlaying, isLoading, play, resume, pause } = useRecitation()
  /** Another Surah's page is open: its Play starts that Surah's Recitation. */
  const isElsewhere = Boolean(
    recited && readingPage && readingPage.surahNumber !== recited.recitation.surahNumber
  )

  const onPlay = () => {
    if (recited && !isElsewhere) resume()
    else if (readingPage) play(readingPage.surahNumber, readingPage.firstAyahInView())
  }

  return isPlaying ? (
    <IconButton
      label="Pause Recitation"
      variant="primary"
      icon={<Icon key="pause" icon={PauseIcon} xstyle={styles.glyph} />}
      onClick={pause}
      xstyle={[styles.play, styles.playing]}
    />
  ) : (
    <IconButton
      label="Play Recitation"
      variant="primary"
      icon={<Icon key="play" icon={PlayIcon} xstyle={styles.glyph} />}
      isLoading={isLoading}
      onClick={onPlay}
      xstyle={styles.play}
    />
  )
}

/**
 * What the bar names at its start: the Recited Ayah once a Recitation has
 * started, else the Surah of the page that is open and its first Ayah in view.
 */
function NowLabel() {
  const { recited, readingPage } = useRecitation()
  if (recited) return <RecitedLink />
  return readingPage && <ReadingLabel page={readingPage} />
}

/**
 * Before a Recitation starts: the indicator at rest, the Surah's name and the
 * first Ayah in view, where Play would start. Laid out as the Recited Ayah is,
 * so the bar keeps its shape when Play is pressed. Not a link: the reader is
 * already on that page.
 */
function ReadingLabel({ page }: { page: ReadingPage }) {
  const { isMobile } = useAppShellMobile()
  const reference = `${page.surahNumber}:${useFirstAyahInView(page)}`

  return (
    <HStack gap={2} vAlign="center" xstyle={[styles.shrinks, isMobile && styles.phoneLink]}>
      <PlayingIndicator isPlaying={false} />
      {isMobile ? (
        <VStack gap={0} xstyle={styles.shrinks}>
          <Text type="body" color="primary" weight="semibold" maxLines={1}>
            {page.surahName}
          </Text>
          <Text type="supporting" color="secondary" hasTabularNumbers textWrap="nowrap">
            Ayah {reference}
          </Text>
        </VStack>
      ) : (
        <HStack gap={2} vAlign="center" xstyle={styles.shrinks}>
          <Text type="supporting" color="primary" weight="semibold" maxLines={1}>
            {page.surahName}
          </Text>
          <Text type="supporting" color="secondary" hasTabularNumbers textWrap="nowrap">
            Ayah {reference}
          </Text>
        </HStack>
      )}
    </HStack>
  )
}

/**
 * The playing indicator with the Surah and Ayah Reference of the Recited
 * Ayah, linking to that Ayah: side by side on a wide screen, the Surah over
 * the Reference on a phone. Nothing before a Recitation has started.
 */
function RecitedLink() {
  const { recited, isPlaying } = useRecitation()
  const { isMobile } = useAppShellMobile()
  const recitation = recited?.recitation
  const recitedAyah = recitation?.ayahs.find(({ number }) => number === recited?.ayah)
  if (!recitation || !recitedAyah) return null

  const surahName = (
    <Text type={isMobile ? 'body' : 'supporting'} color="primary" weight="semibold" maxLines={1}>
      {recitation.surahName}
    </Text>
  )
  const reference = (
    <Text type="inherit" color="inherit" data-testid="recited-ayah">
      {recitedAyah.reference}
    </Text>
  )

  return (
    <Link
      href={urlFor(
        'surahs.show',
        { number: recitation.surahNumber },
        { qs: { ayah: recitedAyah.number } }
      )}
      color="secondary"
      xstyle={styles.shrinks}
    >
      <HStack gap={2} vAlign="center" xstyle={[styles.shrinks, isMobile && styles.phoneLink]}>
        <PlayingIndicator isPlaying={isPlaying} />
        {isMobile ? (
          <VStack gap={0} xstyle={styles.shrinks}>
            {surahName}
            <Text type="supporting" color="inherit" hasTabularNumbers textWrap="nowrap">
              Ayah {reference} · <ElapsedTime recited={recited} />
            </Text>
          </VStack>
        ) : (
          <HStack gap={2} vAlign="center" xstyle={styles.shrinks}>
            {surahName}
            <Text type="supporting" color="inherit" hasTabularNumbers textWrap="nowrap">
              {reference}
            </Text>
          </HStack>
        )}
      </HStack>
    </Link>
  )
}

/**
 * Three bars beside the Surah's name that move while the Recitation plays and
 * rest low while it is paused. Decoration: the Play or Pause button says the
 * same to a screen reader.
 */
function PlayingIndicator({ isPlaying }: { isPlaying: boolean }) {
  return (
    <HStack gap={0.5} vAlign="end" aria-hidden xstyle={styles.indicator}>
      {INDICATOR_BARS.map((delay, index) => (
        <StackItem
          // The three bars never change place.
          // oxlint-disable-next-line react/no-array-index-key
          key={index}
          xstyle={[styles.indicatorBar, delay, isPlaying && styles.indicatorBarPlaying]}
        />
      ))}
    </HStack>
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
      xstyle={styles.ghost}
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
  const { ayahs, surahNumber } = recited.recitation
  const endMs = ayahs.at(-1)?.endMs ?? 1
  const [positionMs, readPosition] = useRecitationPosition(
    Math.max(1, Math.floor(endMs / THUMB_PLACES))
  )
  /** Where the reader holds the thumb, in ms; `null` when they don't. */
  const [draggedMs, setDraggedMs] = useState<number | null>(null)
  /** Whether a key, not a drag, is moving the thumb. */
  const isKeyRef = useRef(false)
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
  const firstInView = useFirstAyahInView(page)
  const [dragged, setDragged] = useState<number | null>(null)

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

/** The first Ayah the reader can see on the page, kept up to date as they scroll. */
function useFirstAyahInView(page: ReadingPage) {
  const [firstInView, setFirstInView] = useState(1)

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

  return firstInView
}

/** The elapsed and total time of the Recitation, e.g. `3:12 / 1:58:40`. */
function RecitationTime({ recited }: { recited: Recited }) {
  return (
    <Text type="supporting" hasTabularNumbers textWrap="nowrap" data-testid="recitation-time">
      <ElapsedTime recited={recited} /> / {clockTime(recitedEndMs(recited))}
    </Text>
  )
}

/** How far into the Recitation it has got, e.g. `3:12`; the phone shows it beside the Ayah. */
function ElapsedTime({ recited }: { recited: Recited }) {
  const [positionMs] = useRecitationPosition(1000)

  return clockTime(Math.min(positionMs, recitedEndMs(recited)))
}

/** Where the Recitation's audio ends, in ms. */
function recitedEndMs(recited: Recited) {
  return recited.recitation.ayahs.at(-1)?.endMs ?? 0
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
