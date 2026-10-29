import { useEffect, useRef, useState } from 'react'

import { fetchAdditionalRelatedStories } from './related-stories-client'
import type { RelatedStory } from './story-types'

const RELATED_STORIES_TARGET_COUNT = 10

/**
 * Loads additional MISO-recommended related stories once the page has
 * fully rendered and the user starts scrolling, topping up whatever GSSP
 * already provided up to `RELATED_STORIES_TARGET_COUNT`.
 */
export function useLoadMoreRelatedStories(
  slug: string,
  initialRelatedStories: RelatedStory[]
): RelatedStory[] {
  const [allRelatedStories, setAllRelatedStories] = useState(
    initialRelatedStories
  )
  const [prevSlug, setPrevSlug] = useState(slug)

  // Client-side navigation between stories reuses this page instance, so
  // the state must be reset to the new story's GSSP(getServerSideProps) data.
  if (prevSlug !== slug) {
    setPrevSlug(slug)
    setAllRelatedStories(initialRelatedStories)
  }

  const allRelatedStoriesRef = useRef(allRelatedStories)

  useEffect(() => {
    allRelatedStoriesRef.current = allRelatedStories
  }, [allRelatedStories])

  useEffect(() => {
    let cleanupScrollHandler = () => {}
    let isMounted = true

    // Wait for page to be fully rendered before setting up miso API calls.
    const setupScrollHandler = () => {
      const handleScroll = async () => {
        const currentRelatedStories = allRelatedStoriesRef.current

        if (currentRelatedStories.length >= RELATED_STORIES_TARGET_COUNT) {
          return
        }

        const additionalStories = await fetchAdditionalRelatedStories(
          slug,
          currentRelatedStories,
          RELATED_STORIES_TARGET_COUNT - currentRelatedStories.length
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
