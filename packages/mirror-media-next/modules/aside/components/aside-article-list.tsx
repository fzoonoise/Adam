import { Fragment, useEffect, useRef, useState } from 'react'

import { AD_SLOT_LAYOUTS } from '@/components/ads/ad-slot-layouts'
import { PrismAdSlot } from '@/components/ads/prism/prism-ad-slot'
import {
  PRISM_SIDE_PLACEMENTS,
  type PrismAsidePlacementContext,
} from '@/components/ads/prism/prism-config'
import { Typography } from '@/components/ui/typography'
import { useDisplayAd } from '@/hooks/useDisplayAd'
import type { StoryList } from '@/utils/gtm/story-list'

import type { AsideArticle } from '../aside-types'

import { AsideArticleItem } from './aside-article-item'

type AsideArticleListProps = {
  articles?: AsideArticle[]
  /**
   * When given, the list fetches its own articles the first time it enters the
   * viewport, and `articles` is ignored.
   */
  fetchFunc?: () => Promise<AsideArticle[]>
  prismPlacement?: PrismAsidePlacementContext
  renderAmount?: number
  storyList?: StoryList
  title: string
}

export function AsideArticleList({
  articles = [],
  fetchFunc,
  prismPlacement,
  renderAmount = 6,
  storyList,
  title,
}: AsideArticleListProps) {
  const { isLoggedIn, isLogInProcessFinished, shouldShowAd } = useDisplayAd()
  const keepsAdSlots = !isLoggedIn && (!isLogInProcessFinished || shouldShowAd)

  const wrapperRef = useRef<HTMLElement>(null)
  const [fetchedArticles, setFetchedArticles] = useState<AsideArticle[]>([])

  // A new `fetchFunc` is a new list to fetch — moving between category pages
  // changes which section the latest articles come from — so this starts a
  // fresh round rather than remembering that it already fetched once.
  useEffect(() => {
    const wrapper = wrapperRef.current

    if (!fetchFunc || !wrapper) {
      return
    }
    let isStale = false
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return
        }
        observer.unobserve(entry.target)
        fetchFunc().then((articles) => {
          if (!isStale) {
            setFetchedArticles(articles)
          }
        })
      })
    })
    observer.observe(wrapper)

    return () => {
      isStale = true
      observer.disconnect()
    }
  }, [fetchFunc])

  const renderedArticles = fetchFunc ? fetchedArticles : articles
  const adSlotCount = prismPlacement && keepsAdSlots ? 2 : 0
  const articleRenderAmount =
    renderAmount + (prismPlacement && !keepsAdSlots ? 2 : 0)
  const reservedRowCount = articleRenderAmount + adSlotCount
  const reservedGapCount = Math.max(reservedRowCount - 1, 0)
  const reservedRowHeight = AD_SLOT_LAYOUTS.prism.asideArticleRow.heightPx

  return (
    <section className="w-full" ref={wrapperRef}>
      <Typography
        as="p"
        variant="h6"
        className="flex h-7 items-center justify-center rounded-t-mm-m bg-mm-base-700 text-mm-second-200"
      >
        {title}
      </Typography>

      {/*
        Reserving the height keeps the page from jumping when a lazily fetched
        list arrives. Article rows and the current Prism contract both reserve
        114px; the rest is this container's own padding and gaps.
      */}
      <div
        className="space-y-mm-2xl bg-mm-neutral-100 px-[21px] pt-mm-5xl pb-mm-2xl"
        style={{
          minHeight:
            prismPlacement && !keepsAdSlots
              ? undefined
              : `calc(var(--spacing-mm-5xl) + var(--spacing-mm-2xl) + ${reservedRowCount} * ${reservedRowHeight}px + ${reservedGapCount} * var(--spacing-mm-2xl))`,
        }}
      >
        {renderedArticles
          .slice(0, articleRenderAmount)
          .map((article, index) => {
            const prismPlacementIndex = index === 1 ? 0 : index === 2 ? 1 : null
            const slot =
              keepsAdSlots && prismPlacement && prismPlacementIndex !== null
                ? PRISM_SIDE_PLACEMENTS[prismPlacement][prismPlacementIndex]
                : null

            return (
              <Fragment key={article.id}>
                <AsideArticleItem article={article} storyList={storyList} />
                {slot && (
                  <PrismAdSlot
                    className={AD_SLOT_LAYOUTS.prism.asideArticleRow.className}
                    enabled={shouldShowAd}
                    placement={slot}
                  />
                )}
              </Fragment>
            )
          })}
      </div>
    </section>
  )
}
