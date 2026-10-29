import { useEffect, useState } from 'react'

import type { ExternalPost, ExternalRelatedStory } from './external-types'
import {
  fetchAdditionalExternalRelatedStories,
  initializeExternalRelatedStories,
} from './related-stories-client'

/**
 * Loads additional MISO-recommended related stories once the page has
 * fully rendered and the user starts scrolling, appending them to the
 * relateds GSSP already provided.
 */
export function useLoadMoreExternalRelatedStories(
  slug: string,
  relateds: ExternalPost['relateds']
): ExternalRelatedStory[] {
  const [allRelatedStories, setAllRelatedStories] = useState(() =>
    initializeExternalRelatedStories(relateds)
  )
  const [prevSlug, setPrevSlug] = useState(slug)

  // Client-side navigation between externals reuses this page instance, so
  // the state must be reset to the new external's GSSP(getServerSideProps) data.
  if (prevSlug !== slug) {
    setPrevSlug(slug)
    setAllRelatedStories(initializeExternalRelatedStories(relateds))
  }

  useEffect(() => {
    let cleanupScrollHandler = () => {}
    let isMounted = true

    // Wait for page to be fully rendered before setting up miso API calls.
    const setupScrollHandler = () => {
      const handleScroll = async () => {
        const additionalStories = await fetchAdditionalExternalRelatedStories(
          slug,
          10
        )

        if (isMounted && additionalStories.length > 0) {
          setAllRelatedStories((prev) => [...prev, ...additionalStories])
        }
      }

      window.addEventListener('scroll', handleScroll, { once: true })
      cleanupScrollHandler = () =>
        window.removeEventListener('scroll', handleScroll)
    }

    // Execute after page is fully loaded to avoid blocking TTFB
    if (document.readyState === 'complete') {
      // Page already loaded, setup immediately
      setupScrollHandler()
    } else {
      // Wait for page to finish loading
      window.addEventListener('load', setupScrollHandler, { once: true })
    }

    return () => {
      isMounted = false
      window.removeEventListener('load', setupScrollHandler)
      cleanupScrollHandler()
    }
  }, [slug])

  return allRelatedStories
}
