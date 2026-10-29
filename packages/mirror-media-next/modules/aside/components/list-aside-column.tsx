import dynamic from 'next/dynamic'

import { GPT_Placeholder_Aside } from '@/components/ads/gpt/gpt-placeholder'
import { usePinnedAside } from '@/hooks/use-pinned-aside'
import { useDisplayAd } from '@/hooks/useDisplayAd'

import { FbPagePlugin } from './fb-page-plugin'
import { GoogleNewsFollow } from './google-news-follow'
import { LatestArticles } from './latest-articles'
import { PopularArticles } from './popular-articles'

const GPTAd = dynamic(() => import('@/components/ads/gpt/gpt-ad'), {
  ssr: false,
})

type ListAsideColumnProps = {
  /** GPT 的 pageKey。沒有所屬 section 的頁面用 `'other'`。 */
  pageKey: string
  /** 空字串時，最新文章會 fallback 到新聞列表。 */
  sectionSlug: string
}

/**
 * 列表頁右側的欄位。依捲動方向釘在畫面底部或 header 下方，做法見 `usePinnedAside`。
 *
 * `lg` 以下整塊不顯示，所以手機不會打最新文章與熱門文章那兩支 API。外層那個 div 不是
 * 多餘的：它是 flex item、會被拉成整列高度，sticky 與 padding 的行程來自它。
 */
export function ListAsideColumn({
  pageKey,
  sectionSlug,
}: ListAsideColumnProps) {
  const { isLoggedIn, isLogInProcessFinished, shouldShowAd } = useDisplayAd()
  const keepsAdSlot = !isLoggedIn && (!isLogInProcessFinished || shouldShowAd)
  const { asideRef, columnRef, paddingTop, top } = usePinnedAside()

  return (
    <div
      className="hidden w-full max-w-106 shrink-0 lg:block"
      ref={columnRef}
      style={{ paddingTop }}
    >
      <aside
        ref={asideRef}
        className="sticky flex flex-col gap-mm-4xl"
        style={{ top }}
      >
        <LatestArticles sectionSlug={sectionSlug} />
        {keepsAdSlot && (
          <GPT_Placeholder_Aside
            shouldShowAd={shouldShowAd}
            isLogInProcessFinished={isLogInProcessFinished}
          >
            {shouldShowAd && (
              <GPTAd
                adKey="PC_R2"
                className="mx-auto h-auto w-full"
                pageKey={pageKey}
              />
            )}
          </GPT_Placeholder_Aside>
        )}
        <PopularArticles placement="list" />
        <GoogleNewsFollow />
        <FbPagePlugin />
      </aside>
    </div>
  )
}
