import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import type { ShownWord } from '~/components/quran/use_recitation'

type WordPopovers = {
  subscribe: (listener: () => void) => () => void
  getShown: () => ShownWord
  /** The reader opens or closes a Word's popover by hand. */
  onOpenChange: (location: string, isOpen: boolean) => void
}

const WordPopoversContext = createContext<WordPopovers | null>(null)

/**
 * Keeps one Word popover open at a time across the Surah, so the Recitation
 * and the reader share it.
 *
 * A long Surah has thousands of Words, so each Word subscribes only to its own
 * popover (`useWordPopover`). When the open Word changes, only the Word that
 * closed and the Word that opened re-render.
 */
export function WordPopoversProvider({
  shown,
  onOpenChange,
  children,
}: {
  /** The Word whose popover is open, and who opened it. */
  shown: ShownWord
  onOpenChange: WordPopovers['onOpenChange']
  children: ReactNode
}) {
  const shownRef = useRef(shown)
  const listenersRef = useRef(new Set<() => void>())

  useLayoutEffect(() => {
    shownRef.current = shown
    for (const listener of listenersRef.current) listener()
  }, [shown])

  const value = useMemo<WordPopovers>(
    () => ({
      subscribe: (listener) => {
        listenersRef.current.add(listener)
        return () => listenersRef.current.delete(listener)
      },
      getShown: () => shownRef.current,
      onOpenChange,
    }),
    [onOpenChange]
  )

  return <WordPopoversContext.Provider value={value}>{children}</WordPopoversContext.Provider>
}

/**
 * Who has the Word at `location` open (the Recitation or the reader), or
 * `null` when its popover is closed; and how the reader opens or closes it.
 */
export function useWordPopover(location: string) {
  const popovers = useContext(WordPopoversContext)
  if (!popovers) throw new Error('useWordPopover needs a WordPopoversProvider')
  const { subscribe, getShown, onOpenChange } = popovers
  const openedByNow = () => {
    const shown = getShown()
    return shown?.location === location ? shown.by : null
  }
  const openedBy = useSyncExternalStore(subscribe, openedByNow, openedByNow)

  return { openedBy, onOpenChange }
}
