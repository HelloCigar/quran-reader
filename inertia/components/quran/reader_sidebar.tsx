import * as stylex from '@stylexjs/stylex'
import { useDeferredValue, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
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
import { urlFor } from '~/client'
import { useRouteForm } from '~/components/forms/use_route_form'
import { useReaderPreference } from '~/components/quran/use_reader_preference'

type Surah = Data.Surah.Variants['forNavigation']

/** Surah: just the Surahs. Verse: the open Surah's Ayahs beside them. */
type Mode = 'verse' | 'surah'

const styles = stylex.create({
  /** The Ayah column, and the Verse box above it, take a fixed share. */
  ayahColumn: {
    flexBasis: '30%',
    flexShrink: 0,
  },
  /** Room for "114", so the Surah names line up. */
  surahNumber: {
    minWidth: '3ch',
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
 * that Ayah or shows why it can't. The switch is remembered.
 */
export default function ReaderSidebar({
  surahs,
  current,
  initialMode,
  onClose,
}: {
  surahs: Surah[]
  current: number
  /** Surah or Verse, as the reader last chose (kept in a cookie). */
  initialMode: Mode
  /** Shows a close button, for the sidebar in a drawer. */
  onClose?: () => void
}) {
  const [mode, setMode] = useReaderPreference('reader_sidebar_mode', initialMode)
  const [query, setQuery] = useState('')
  const [verse, setVerse] = useState('')
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
            value={mode}
            onChange={(value) => setMode(value as Mode)}
          >
            <SegmentedControlItem value="surah" label="Surah" />
            <SegmentedControlItem value="verse" label="Verse" />
          </SegmentedControl>
        </StackItem>
        {onClose && (
          <IconButton
            label="Close"
            variant="ghost"
            icon={<Icon icon={XMarkIcon} />}
            onClick={onClose}
          />
        )}
      </HStack>
      <HStack gap={2} vAlign="start">
        <StackItem size="fill">
          <TextInput
            type="search"
            label="Search Surah"
            isLabelHidden
            placeholder="Search Surah"
            autoComplete="off"
            value={query}
            onChange={setQuery}
          />
        </StackItem>
        {mode === 'verse' && (
          <StackItem xstyle={styles.ayahColumn}>
            <form onSubmit={goToVerse}>
              <TextInput
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
              <List ref={surahListRef} density="compact" aria-label="Surahs">
                {shownSurahs.map((surah) => (
                  <ListItem
                    key={surah.number}
                    startContent={
                      <Text
                        type="body"
                        color="secondary"
                        hasTabularNumbers
                        xstyle={styles.surahNumber}
                      >
                        {surah.number}
                      </Text>
                    }
                    label={surah.name}
                    href={urlFor('surahs.show', { number: surah.number })}
                    isSelected={surah.number === current}
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
                <List density="compact" aria-label={`Ayahs of ${openSurah.name}`}>
                  {shownAyahs.map((ayah) => (
                    <ListItem
                      key={ayah}
                      label={String(ayah)}
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
