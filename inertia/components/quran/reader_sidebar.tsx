import * as stylex from '@stylexjs/stylex'
import { useDeferredValue, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import {
  borderVars,
  colorVars,
  durationVars,
  fontWeightVars,
  radiusVars,
  spacingVars,
  textSizeVars,
} from '@astryxdesign/core/theme/tokens.stylex'
import { VStack } from '@astryxdesign/core/VStack'
import { HStack } from '@astryxdesign/core/HStack'
import { StackItem } from '@astryxdesign/core/Layout'
import { SegmentedControl, SegmentedControlItem } from '@astryxdesign/core/SegmentedControl'
import { IconButton } from '@astryxdesign/core/IconButton'
import { Icon } from '@astryxdesign/core/Icon'
import { TextInput } from '@astryxdesign/core/TextInput'
import { List, ListItem } from '@astryxdesign/core/List'
import { Text } from '@astryxdesign/core/Text'
import type { Data } from '@generated/data'
import ArabicText from '~/components/quran/arabic_text'
import { urlFor } from '~/client'
import { useRouteForm } from '~/components/forms/use_route_form'
import type { SidebarMode } from '~/components/quran/use_reader_sidebar'

type Surah = Data.Surah.Variants['forNavigation']

const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)'

/** Sizes the scales have no stop for, built from their stops. */
const SPACE_10 = `calc(${spacingVars['--spacing-2']} + ${spacingVars['--spacing-0-5']})`
const SIZE_44 = `calc(${spacingVars['--spacing-10']} + ${spacingVars['--spacing-1']})`
const SIZE_36 = `calc(${spacingVars['--spacing-8']} + ${spacingVars['--spacing-1']})`
const ROW_RADIUS = `calc(${spacingVars['--spacing-3']})`
const NUMBER_SIZE = `calc((${textSizeVars['--font-size-sm']} + ${textSizeVars['--font-size-base']}) / 2)`
const ACCENT_WASH = `color-mix(in srgb, ${colorVars['--color-accent']} 10%, transparent)`

const styles = stylex.create({
  /** The Surah's Arabic name at the end of its row, at 17px. */
  surahArabic: {
    fontSize: textSizeVars['--font-size-lg'],
    lineHeight: 1.4,
  },
  /** The close button is a 40px round target, quiet until it is pressed. */
  close: {
    borderRadius: radiusVars['--radius-full'],
    transform: {
      default: 'scale(1)',
      ':active': { default: 'scale(0.88)', [REDUCED_MOTION]: 'scale(1)' },
    },
    transitionDuration: { default: durationVars['--duration-fast'], [REDUCED_MOTION]: '0s' },
  },
  /**
   * The Surah | Verse switch is a pill track; its selected segment is the
   * card colour, lifted by the control's own shadow, the way the top bar's is.
   */
  switch: {
    borderRadius: radiusVars['--radius-full'],
    '--_segmented-control-radius': radiusVars['--radius-full'],
    '--color-background-surface': colorVars['--color-background-card'],
    '--size-element-lg': SIZE_44,
  },
  /** A search box 44px tall with soft 14px corners, on the body colour. */
  field: {
    minHeight: SIZE_44,
    borderRadius: `calc(${spacingVars['--spacing-3']} + ${spacingVars['--spacing-0-5']})`,
    backgroundColor: colorVars['--color-background-body'],
  },
  /** The Ayah column is 76px wide, and a hairline sets it off from the Surahs. */
  ayahColumn: {
    flexBasis: `calc(${spacingVars['--spacing-12']} + ${spacingVars['--spacing-7']})`,
    flexShrink: 0,
    flexGrow: 0,
    paddingInlineStart: spacingVars['--spacing-2'],
    borderInlineStartWidth: borderVars['--border-width'],
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: colorVars['--color-border'],
  },
  /** The Verse box above the Ayah column is as wide as the column and its edge. */
  verseBox: {
    flexBasis: `calc(${spacingVars['--spacing-12']} * 2)`,
    flexShrink: 0,
    flexGrow: 0,
  },
  /** A row 44px tall with 12px corners; it fills with a wash on hover. */
  surahRow: {
    minHeight: SIZE_44,
    borderRadius: ROW_RADIUS,
    paddingBlock: spacingVars['--spacing-0'],
    paddingInline: SPACE_10,
    columnGap: SPACE_10,
    backgroundColor: {
      default: 'transparent',
      ':hover': `color-mix(in srgb, ${colorVars['--color-text-primary']} 5%, transparent)`,
    },
    transitionProperty: { default: 'background-color', [REDUCED_MOTION]: 'none' },
    transitionDuration: durationVars['--duration-fast'],
  },
  /** The open Surah: a green wash, and its number in the accent. */
  surahCurrent: {
    backgroundColor: ACCENT_WASH,
    fontWeight: fontWeightVars['--font-weight-semibold'],
  },
  /** An Ayah is a 36px tall target with 10px corners. */
  ayahRow: {
    minHeight: SIZE_36,
    borderRadius: SPACE_10,
    paddingBlock: spacingVars['--spacing-0'],
    paddingInline: SPACE_10,
    backgroundColor: {
      default: 'transparent',
      ':hover': `color-mix(in srgb, ${colorVars['--color-text-primary']} 5%, transparent)`,
    },
    transitionProperty: { default: 'background-color', [REDUCED_MOTION]: 'none' },
    transitionDuration: durationVars['--duration-fast'],
  },
  /** The numbers of a row are 13px and line up in a column. */
  number: {
    fontSize: NUMBER_SIZE,
  },
  /** An Ayah's number is centred in its column. */
  ayahNumber: {
    width: '100%',
    textAlign: 'center',
  },
  /** Room for "114", so the Surah names line up. */
  surahNumber: {
    minWidth: `calc(${spacingVars['--spacing-7']})`,
  },
})

/** "Al-Baqarah" and "al baqarah" both match "baqara". */
function searchable(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '')
}

/**
 * The reading page's way around the Quran: a Surah | Verse switch, a Search
 * Surah box, and the Surahs with the one being read marked; choosing one
 * opens it. Verse mode also lists the open Surah's Ayahs in a second column,
 * which scrolls on its own; the Verse box filters them, and Enter there opens
 * that Ayah or shows why it can't. `ReaderLayout` owns the mode, which the
 * panel and the drawer share.
 */
export default function ReaderSidebar({
  surahs,
  current,
  mode,
  onModeChange,
  onClose,
}: {
  surahs: Surah[]
  current: number
  mode: SidebarMode
  onModeChange: (mode: SidebarMode) => void
  /** Shows a close button, for the sidebar in a drawer. */
  onClose?: () => void
}) {
  /** In the phone's drawer the rows are tapped, so they get a finger's height. */
  const density = onClose ? 'balanced' : 'compact'
  const [query, setQuery] = useState('')
  const [verse, setVerse] = useState('')
  /** The Verse box filters the open Surah's Ayahs, so it clears when another opens. */
  const [verseOf, setVerseOf] = useState(current)
  if (verseOf !== current) {
    setVerseOf(current)
    setVerse('')
  }
  const surahListRef = useRef<HTMLUListElement>(null)
  const openSurah = surahs.find((surah) => surah.number === current) ?? surahs[0]
  const form = useRouteForm(
    'ayahs.show',
    { reference: '' },
    { preserveState: 'errors', preserveScroll: 'errors' }
  )
  const verseError = form.errors.reference

  const deferredQuery = useDeferredValue(query)
  const shownSurahs = useMemo(() => {
    const term = searchable(deferredQuery)
    if (term === '') return surahs
    return surahs.filter(
      (surah) =>
        String(surah.number).startsWith(term) ||
        // A substring match on one name (String#includes), not an array lookup a Set could replace.
        // react-doctor-disable-next-line js-set-map-lookups
        searchable(surah.name).includes(term)
    )
  }, [surahs, deferredQuery])
  const shownAyahs = useMemo(() => {
    const ayahs = Array.from({ length: openSurah.ayahCount }, (_, index) => index + 1)
    const term = verse.trim()
    return term === '' ? ayahs : ayahs.filter((ayah) => String(ayah).startsWith(term))
  }, [openSurah, verse])

  useEffect(() => {
    surahListRef.current
      ?.querySelector('[aria-current="true"]')
      ?.scrollIntoView({ block: 'center' })
  }, [current])

  function goToVerse(event: FormEvent) {
    event.preventDefault()
    form.transform(() => ({ reference: `${openSurah.number}:${verse.trim()}` }))
    form.submit()
  }

  return (
    <VStack gap={4} height="100%">
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <SegmentedControl
            label="Find by"
            layout="fill"
            size="lg"
            xstyle={styles.switch}
            value={mode}
            onChange={(value) => onModeChange(value as SidebarMode)}
          >
            <SegmentedControlItem value="surah" label="Surah" />
            <SegmentedControlItem value="verse" label="Verse" />
          </SegmentedControl>
        </StackItem>
        {onClose && (
          <IconButton
            label="Close"
            variant="ghost"
            size="lg"
            icon={<Icon icon={XMarkIcon} color="secondary" />}
            onClick={onClose}
            xstyle={styles.close}
          />
        )}
      </HStack>
      <HStack gap={2} vAlign="start">
        <StackItem size="fill">
          <TextInput
            type="search"
            startIcon={MagnifyingGlassIcon}
            controlXstyle={styles.field}
            label="Search Surah"
            isLabelHidden
            placeholder="Search Surah"
            autoComplete="off"
            value={query}
            onChange={setQuery}
          />
        </StackItem>
        {mode === 'verse' && (
          <StackItem xstyle={styles.verseBox}>
            <form onSubmit={goToVerse}>
              <TextInput
                controlXstyle={styles.field}
                label="Verse"
                isLabelHidden
                placeholder="Verse"
                autoComplete="off"
                inputMode="numeric"
                enterKeyHint="go"
                value={verse}
                onChange={(value) => {
                  setVerse(value)
                  if (verseError) form.clearErrors('reference')
                }}
                status={verseError ? { type: 'error', message: verseError } : undefined}
              />
            </form>
          </StackItem>
        )}
      </HStack>
      <StackItem size="fill">
        <HStack gap={2} height="100%">
          <StackItem size="fill" isScrollable aria-label="Surahs list">
            {shownSurahs.length === 0 ? (
              <Text type="supporting">No surah matches &ldquo;{query}&rdquo;.</Text>
            ) : (
              <List ref={surahListRef} density={density} aria-label="Surahs">
                {shownSurahs.map((surah) => (
                  <ListItem
                    key={surah.number}
                    startContent={
                      <Text
                        type="body"
                        color={surah.number === current ? 'accent' : 'secondary'}
                        hasTabularNumbers
                        xstyle={[styles.number, styles.surahNumber]}
                      >
                        {surah.number}
                      </Text>
                    }
                    label={surah.name}
                    endContent={
                      <ArabicText color="secondary" xstyle={styles.surahArabic}>
                        {surah.arabicName}
                      </ArabicText>
                    }
                    href={urlFor('surahs.show', { number: surah.number })}
                    isSelected={surah.number === current}
                    xstyle={[styles.surahRow, surah.number === current && styles.surahCurrent]}
                  />
                ))}
              </List>
            )}
          </StackItem>
          {mode === 'verse' && (
            <StackItem xstyle={styles.ayahColumn} isScrollable aria-label="Ayahs list">
              {shownAyahs.length === 0 ? (
                <Text type="supporting">No such ayah.</Text>
              ) : (
                <List density={density} aria-label={`Ayahs of ${openSurah.name}`}>
                  {shownAyahs.map((ayah) => (
                    <ListItem
                      key={ayah}
                      label={
                        <Text
                          type="body"
                          display="block"
                          hasTabularNumbers
                          xstyle={[styles.number, styles.ayahNumber]}
                        >
                          {ayah}
                        </Text>
                      }
                      xstyle={styles.ayahRow}
                      href={urlFor('surahs.show', { number: openSurah.number }, { qs: { ayah } })}
                    />
                  ))}
                </List>
              )}
            </StackItem>
          )}
        </HStack>
      </StackItem>
    </VStack>
  )
}
