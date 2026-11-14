import { useCallback, useState } from 'react'

const ONE_YEAR = 60 * 60 * 24 * 365

/**
 * A choice the reader makes about the reading page, such as hiding the
 * sidebar. It is kept in the `cookie` named, which the reading page's
 * controller reads back and passes as `initial`, so the server renders the
 * page with the choice already in place.
 */
export function useReaderPreference<T extends string>(cookie: string, initial: T) {
  const [value, setValueState] = useState(initial)

  const setValue = useCallback(
    (next: T) => {
      setValueState(next)
      document.cookie = `${cookie}=${next}; path=/; max-age=${ONE_YEAR}; samesite=lax`
    },
    [cookie]
  )

  return [value, setValue] as const
}
