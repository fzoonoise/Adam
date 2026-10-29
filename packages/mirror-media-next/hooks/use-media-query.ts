import { useEffect, useState } from 'react'

export type MediaQueryResult = {
  /**
   * True after the browser has evaluated the current query with `matchMedia`.
   * It is false during SSR, the initial client render, and after `query`
   * changes until the new query has been evaluated.
   */
  isMediaQueryResolved: boolean
  /** The query result. It stays false while the current query is unresolved. */
  matches: boolean
}

type ResolvedMediaQuery = {
  matches: boolean
  query: string
}

/**
 * Unlike `useWindowDimensions`, which re-renders every consumer on every
 * `resize` pixel, this only re-renders when the media query's boolean
 * result actually flips. `isMediaQueryResolved` distinguishes an unresolved
 * query from a real non-match.
 */
export default function useMediaQuery(query: string): MediaQueryResult {
  const [resolvedMediaQuery, setResolvedMediaQuery] =
    useState<ResolvedMediaQuery | null>(null)

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query)
    const updateResult = () => {
      setResolvedMediaQuery({
        matches: mediaQueryList.matches,
        query,
      })
    }

    updateResult()
    mediaQueryList.addEventListener('change', updateResult)

    return () => mediaQueryList.removeEventListener('change', updateResult)
  }, [query])

  const isMediaQueryResolved = resolvedMediaQuery?.query === query

  return {
    isMediaQueryResolved,
    matches:
      isMediaQueryResolved && resolvedMediaQuery
        ? resolvedMediaQuery.matches
        : false,
  }
}
