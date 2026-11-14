import { createContext, useContext, type ReactNode } from 'react'
import type { ShownWord } from '~/components/quran/use_recitation'

type WordPopovers = {
  /** The Word whose popover is open, and who opened it. */
  shown: ShownWord
  /** The reader opens or closes a Word's popover by hand. */
  onOpenChange: (location: string, isOpen: boolean) => void
}

const WordPopoversContext = createContext<WordPopovers | null>(null)

/**
 * Keeps one Word popover open at a time across the Surah, so the Recitation
 * and the reader share it.
 */
export function WordPopoversProvider({
  value,
  children,
}: {
  value: WordPopovers
  children: ReactNode
}) {
  return <WordPopoversContext.Provider value={value}>{children}</WordPopoversContext.Provider>
}

export function useWordPopovers(): WordPopovers {
  const value = useContext(WordPopoversContext)
  if (!value) throw new Error('useWordPopovers needs a WordPopoversProvider')
  return value
}
