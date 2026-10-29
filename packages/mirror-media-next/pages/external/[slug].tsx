//TODO: add component to add html head dynamically, not jus write head in every pag
import type { GetServerSideProps } from 'next'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'

import FullScreenAds from '@/components/ads/full-screen-ads'
import GptAd from '@/components/ads/gpt/gpt-ad'
import {
  GPT_Placeholder,
  GPT_Placeholder_Aside,
} from '@/components/ads/gpt/gpt-placeholder'
import DableAd from '@/components/common/dable-ad'
import generateJsonLdsData from '@/components/external/shared/json-lds-data'
import JsonLdsScript from '@/components/external/shared/json-lds-script'
import { ExternalLayout } from '@/components/shell/article/external-layout'
import { NextUpPosts } from '@/components/shell/article/next-up-posts'
import { PageShell } from '@/components/shell/page-shell'
import { ENV, SITE_URL } from '@/config/index.mjs'
import { useDisplayAd } from '@/hooks/useDisplayAd'
import { FbPagePlugin } from '@/modules/aside/components/fb-page-plugin'
import { GoogleNewsFollow } from '@/modules/aside/components/google-news-follow'
import { LatestArticles } from '@/modules/aside/components/latest-articles'
import { PopularArticles } from '@/modules/aside/components/popular-articles'
import { fetchExternalPost } from '@/modules/external/external-data'
import type { ExternalPost } from '@/modules/external/external-types'
import { useLoadMoreExternalRelatedStories } from '@/modules/external/use-load-more-external-related-stories'
import type { StoryDataLayer } from '@/types/dataLayer'
import { getLogTraceObject } from '@/utils'
import { getPageKeyByPartnerShowOnIndex } from '@/utils/ad'
import type { ShellHeaderData } from '@/utils/api'
import { fetchShellHeaderData } from '@/utils/api'
import { setPageCache } from '@/utils/cache-setting'
import { buildExternalDataLayer } from '@/utils/gtm/build-data-layer'
import { STORY_LIST_BOOTSTRAP_SCRIPT } from '@/utils/gtm/story-list'
import { toTaipeiISOString } from '@/utils/index'

const MisoPageView = dynamic(() => import('@/components/miso-pageview'), {
  ssr: false,
})

type ExternalPageProps = {
  external: ExternalPost
  headerData: ShellHeaderData
  jsonLdData: object[]
  dataLayer: StoryDataLayer
}

export default function External({
  external,
  headerData,
  jsonLdData,
}: ExternalPageProps) {
  const router = useRouter()
  const { slug } = router.query
  const ampUrl = `https://${SITE_URL}/external/amp/${slug}`
  const allRelatedStories = useLoadMoreExternalRelatedStories(
    external.slug ?? '',
    external.relateds
  )

  const { shouldShowAd, isLogInProcessFinished } = useDisplayAd()
  const pageKeyForGptAd = getPageKeyByPartnerShowOnIndex(
    external.partner?.showOnIndex ?? false
  )

  const robots = 'index, max-image-preview:large'

  const pubDate = (
    <meta
      name="pubdate"
      property="article:published_time"
      itemProp="datePublished"
      content={toTaipeiISOString(external?.publishedDate)}
      key="article:published_time"
    />
  )

  const lastMod = (
    <meta
      name="lastmod"
      property="article:modified_time"
      itemProp="dateModified"
      content={toTaipeiISOString(external?.updatedAt)}
      key="article:modified_time"
    />
  )

  const authorName = external?.partner?.name
    ? external?.partner.name
    : external?.extend_byline || ''

  return (
    <>
      <Head>
        <script
          id="mm-story-list"
          dangerouslySetInnerHTML={{ __html: STORY_LIST_BOOTSTRAP_SCRIPT }}
        />
        <meta name="robots" content={robots} key="robots" />
        <meta
          property="dable:item_id"
          content={Array.isArray(slug) ? slug?.[0] : slug}
          key="dable:item_id"
        />
        <meta
          property="og:slug"
          content={Array.isArray(slug) ? slug?.[0] : slug}
          key="og:slug"
        />
        <link rel="amphtml" href={ampUrl} key="amphtml" />
        {external?.publishedDate && pubDate}
        {external?.updatedAt && lastMod}
        {authorName && (
          <>
            <meta name="author" content={authorName} key="author" />
            <meta
              property="article:author"
              content={authorName}
              key="article:author"
            />
          </>
        )}
        <meta
          name="publisher"
          itemProp="publisher"
          content="鏡週刊 Mirror Media"
          key="publisher"
        />
      </Head>
      <PageShell
        head={{
          // This page's Head owns robots.
          robotsMetaContent: null,
          title: `${external?.title}`,
          imageUrl: external?.thumb ?? undefined,
          pageType: 'external',
          pageSlug: `${slug}`,
          description: external?.brief ?? undefined,
        }}
        headerData={headerData}
      >
        <MisoPageView productIds={`external_${slug}`} />

        <GPT_Placeholder
          shouldShowAd={shouldShowAd}
          isLogInProcessFinished={isLogInProcessFinished}
        >
          {shouldShowAd && (
            <GptAd
              pageKey={pageKeyForGptAd}
              adKey="HD"
              className="h-auto w-full"
            />
          )}
        </GPT_Placeholder>
        <ExternalLayout
          {...external}
          allRelatedStories={allRelatedStories}
          renderAside={() => (
            <>
              <GPT_Placeholder_Aside
                shouldShowAd={shouldShowAd}
                isLogInProcessFinished={isLogInProcessFinished}
              >
                <GptAd
                  pageKey={pageKeyForGptAd}
                  adKey="PC_R1"
                  className="hidden xl:mx-auto xl:block xl:h-auto xl:w-full"
                />
              </GPT_Placeholder_Aside>
              <LatestArticles sectionSlug="news" />
              <div className="sticky top-12 space-y-6">
                <GPT_Placeholder_Aside
                  shouldShowAd={shouldShowAd}
                  isLogInProcessFinished={isLogInProcessFinished}
                >
                  <GptAd
                    pageKey={pageKeyForGptAd}
                    adKey="PC_R2"
                    className="hidden xl:mx-auto xl:my-5 xl:block xl:h-auto xl:w-full"
                  />
                </GPT_Placeholder_Aside>
                <PopularArticles placement="article" />
                <GoogleNewsFollow />
                <FbPagePlugin width={424} />
              </div>
            </>
          )}
          renderNextUp={() => <NextUpPosts items={allRelatedStories} />}
          renderDable={() => (
            <>
              {shouldShowAd && (
                <>
                  <div className="hidden xl:flex xl:min-h-62.5 xl:w-full xl:items-center xl:justify-between xl:pb-4">
                    <GptAd
                      adKey="PC_E1"
                      pageKey={pageKeyForGptAd}
                      className="hidden h-auto w-full xl:m-0 xl:block"
                    />
                    <GptAd
                      adKey="PC_E2"
                      pageKey={pageKeyForGptAd}
                      className="hidden h-auto w-full xl:m-0 xl:block"
                    />
                  </div>
                  <DableAd
                    breakpoint="xl"
                    className="mx-2 md:mx-0 md:min-h-260"
                  />
                </>
              )}
            </>
          )}
        />
        <FullScreenAds />
      </PageShell>
      <JsonLdsScript jsonLdData={jsonLdData} />
    </>
  )
}

export const getServerSideProps: GetServerSideProps<
  ExternalPageProps,
  { slug: string }
> = async ({ params, req, res }) => {
  if (ENV === 'prod') {
    setPageCache(
      res,
      {
        cachePolicy: 'max-age',
        cacheTime: 300,
        sharedCacheTime: 300,
        staleWhileRevalidate: 3600,
      },
      req.url
    )
  } else {
    setPageCache(res, { cachePolicy: 'no-store' }, req.url)
  }

  if (!params?.slug) {
    return { notFound: true }
  }
  const { slug } = params
  const globalLogFields: Record<string, unknown> = { ...getLogTraceObject(req) }

  const [external, headerData] = await Promise.all([
    fetchExternalPost(slug, globalLogFields),
    fetchShellHeaderData({ logFields: globalLogFields }),
  ])

  if (!external) {
    return { notFound: true }
  }

  const jsonLdData = generateJsonLdsData(external, '/external/')

  return {
    props: {
      external,
      headerData,
      jsonLdData,
      dataLayer: buildExternalDataLayer(external),
    },
  }
}
