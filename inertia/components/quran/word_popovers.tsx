import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import type { ShownWord } from '~/components/quran/use_recitation'

type WordPopovers = {
  /** Hears when the popover of the Word at `location` opens or closes. */
  subscribe: (location: string, listener: () => void) => () => void
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
 * closed and the Word that opened are told, and re-render.
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
  /** The listener of each mounted Word, by its location. */
  const listenersRef = useRef(new Map<string, Set<() => void>>())

  useLayoutEffect(() => {
    const closed = shownRef.current?.location
    shownRef.current = shown
    for (const location of new Set([closed, shown?.location])) {
      if (location === undefined) continue
      for (const listener of listenersRef.current.get(location) ?? []) listener()
    }
  }, [shown])

  const value = useMemo<WordPopovers>(
    () => ({
      subscribe: (location, listener) => {
        const listeners = listenersRef.current.get(location) ?? new Set()
        listenersRef.current.set(location, listeners.add(listener))
        return () => {
          listeners.delete(listener)
          if (listeners.size === 0) listenersRef.current.delete(location)
        }
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
  const subscribeHere = useCallback(
    (listener: () => void) => subscribe(location, listener),
    [subscribe, location]
  )
  const openedBy = useSyncExternalStore(subscribeHere, openedByNow, openedByNow)

  return { openedBy, onOpenChange }
}
