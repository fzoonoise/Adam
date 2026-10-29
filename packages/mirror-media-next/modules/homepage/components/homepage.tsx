import dynamic from 'next/dynamic'

import { usePinnedAside } from '@/hooks/use-pinned-aside'

import type { HomepageViewModel } from '../homepage-types'

import { CategoryLatestGrid } from './category-latest-grid'
import { EditorChoiceCarousel } from './editor-choice-carousel'
import { GoogleNewsFollow } from './google-news-follow'
import { HeadlineList } from './headline-list'
import { HomepageAd } from './homepage-ad'
import { HomepageElectionIframe } from './homepage-election-iframe'
import { MoreNews } from './more-news'
import { PromoVideoCarousel } from './promo-video-carousel'

const FullScreenAds = dynamic(
  () => import('@/components/ads/full-screen-ads'),
  { ssr: false }
)

type HomepageProps = {
  data: HomepageViewModel
  isElectionPeriod: boolean
}

const singleColumnContentClass =
  'mx-auto w-[calc(100%-32px)] md:w-[704px] xl:mx-0 xl:w-full'

function Homepage({ data, isElectionPeriod }: HomepageProps) {
  const { asideRef, columnRef, paddingTop, top } = usePinnedAside('xl')

  return (
    <main className="w-full bg-white pb-mm-5xl text-mm-all-black xl:pb-mm-6xl">
      <HomepageElectionIframe isElectionPeriod={isElectionPeriod} />
      <HomepageAd placement="top" wrapperClassName="py-mm-5xl" />

      <div className="grid w-full grid-cols-1 gap-y-mm-5xl md:grid-cols-2 md:gap-x-mm-5xl xl:mx-auto xl:max-w-[1200px] xl:grid-cols-[728px_448px] xl:gap-x-mm-3xl xl:gap-y-0">
        <div className="contents xl:order-0 xl:flex xl:min-w-0 xl:flex-col xl:gap-mm-3xl">
          <div className="order-1 col-span-full w-full xl:order-0">
            <EditorChoiceCarousel articles={data.editorChoices} />
          </div>

          <HomepageAd
            placement="secondary"
            wrapperClassName="order-3 col-span-full xl:order-0"
          />

          <div className="order-4 col-span-full w-full xl:order-0">
            <PromoVideoCarousel videos={data.promoVideos} />
          </div>

          <div
            className={`${singleColumnContentClass} order-7 col-span-full xl:order-0`}
          >
            <CategoryLatestGrid categories={data.categories} />
          </div>

          <div
            className={`${singleColumnContentClass} order-10 col-span-full xl:order-0`}
          >
            <MoreNews
              excludedKeys={data.latestNews.map((article) => article.key)}
              initialArticles={data.moreNews}
              initialHasMore={data.hasMoreNews}
            />
          </div>
        </div>

        <div
          className="contents xl:order-0 xl:block xl:min-w-0"
          ref={columnRef}
          style={{ paddingTop }}
        >
          <aside
            aria-label="首頁側欄"
            className="contents xl:sticky xl:flex xl:w-auto xl:min-w-0 xl:flex-col xl:gap-mm-5xl"
            ref={asideRef}
            style={{ top }}
          >
            <HeadlineList
              articles={data.latestNews}
              className="order-2 col-span-full mx-auto w-[calc(100%-32px)] md:col-span-1 md:mx-0 md:w-[332px] md:justify-self-end xl:order-0 xl:w-full xl:justify-self-auto"
              title="最新新聞"
              titleId="homepage-latest-news-title"
              trackingClassName="GTM-homepage-latest-list"
              storyList="cate_newnews"
            />
            <HeadlineList
              articles={data.popularNews}
              className="order-5 col-span-full mx-auto w-[calc(100%-32px)] md:order-2 md:col-span-1 md:mx-0 md:w-[332px] md:justify-self-start xl:order-2 xl:w-full xl:justify-self-auto"
              title="熱門新聞"
              titleId="homepage-popular-news-title"
              storyList="cate_hotnews"
              withPrismAds
            />
            <GoogleNewsFollow className="order-6 col-span-full mx-auto md:order-5 xl:order-1" />
            <HeadlineList
              articles={data.forumNews}
              className={`${singleColumnContentClass} order-9 col-span-full md:order-8 xl:order-3`}
              title="論壇新聞"
              titleId="homepage-forum-news-title"
              storyList="cate_commentnews"
            />
          </aside>
        </div>
      </div>

      <FullScreenAds />
    </main>
  )
}

export { Homepage }
