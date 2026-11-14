import { useCallback, useSyncExternalStore } from 'react'

/** The choices made in this tab, for a browser that blocks storage. */
const memory = new Map<string, string>()

/** Called when any reader preference changes in this tab. */
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * A choice the reader makes about the reading page, such as hiding the
 * sidebar, kept in this browser so it survives opening another Surah and
 * reloading (where the browser blocks storage, until the tab reloads). Each
 * value is one of `choices`; anything else reads as `fallback`, which the
 * server render also uses.
 */
export function useReaderPreference<T extends string>(
  key: string,
  choices: readonly T[],
  fallback: T
) {
  const storageKey = `reader.${key}`
  const read = useCallback(() => {
    let stored: string | null | undefined
    try {
      stored = window.localStorage.getItem(storageKey)
    } catch {
      stored = memory.get(storageKey)
    }
    return choices.find((choice) => choice === stored) ?? fallback
  }, [storageKey, choices, fallback])
  const value = useSyncExternalStore(subscribe, read, () => fallback)

  const setValue = useCallback(
    (next: T) => {
      memory.set(storageKey, next)
      try {
        window.localStorage.setItem(storageKey, next)
      } catch {
        // Blocked storage: the choice lasts until this tab reloads.
      }
      for (const listener of listeners) listener()
    },
    [storageKey]
  )

  return [value, setValue] as const
}
