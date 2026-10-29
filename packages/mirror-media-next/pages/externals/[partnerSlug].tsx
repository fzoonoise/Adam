import type { GetServerSideProps } from 'next'
import dynamic from 'next/dynamic'

import client from '@/apollo/apollo-client'
import { fetchExternalCounts } from '@/apollo/query/externals'
import { fetchPartnerBySlug } from '@/apollo/query/partner'
import FullScreenAds from '@/components/ads/full-screen-ads'
import GPTMbStAd from '@/components/ads/gpt/gpt-mb-st-ad'
import { GPT_Placeholder } from '@/components/ads/gpt/gpt-placeholder'
import { PageShell } from '@/components/shell/page-shell'
import { Typography } from '@/components/ui/typography'
import { ENV } from '@/config/index.mjs'
import { SITE_DESCRIPTION } from '@/constants'
import { useDisplayAd } from '@/hooks/useDisplayAd'
import { ListAsideColumn } from '@/modules/aside/components/list-aside-column'
import PartnerArticles from '@/modules/externals/components/partner-articles'
import { toExternalListItemData } from '@/modules/externals/externals-data'
import { ListPageMain } from '@/modules/list-article/components/list-page-main'
import type { ArticleListItemData } from '@/modules/list-article/list-article-types'
import { getLogTraceObject } from '@/utils'
import { getPageKeyByPartnerShowOnIndex } from '@/utils/ad'
import type { ShellHeaderData } from '@/utils/api'
import { fetchShellHeaderData } from '@/utils/api'
import { fetchExternalsByPartnerSlug } from '@/utils/api/externals'
import { setPageCache } from '@/utils/cache-setting'
import { getExternalSectionTitle } from '@/utils/external'
import { buildSingleCatDataLayer } from '@/utils/gtm/build-data-layer'
import { processSettledResult } from '@/utils/response-processor'

const GPTAd = dynamic(() => import('@/components/ads/gpt/gpt-ad'), {
  ssr: false,
})

const RENDER_PAGE_SIZE = 12

type ExternalPartnerPageProps = {
  dataLayer: ReturnType<typeof buildSingleCatDataLayer>
  externals: ArticleListItemData[]
  externalsCount: number
  headerData: ShellHeaderData
  partner: { name: string; showOnIndex: boolean; slug: string }
}

export default function ExternalPartnerPage({
  externals,
  externalsCount,
  headerData,
  partner,
}: ExternalPartnerPageProps) {
  const { shouldShowAd, isLogInProcessFinished } = useDisplayAd()

  const gptPageKey = getPageKeyByPartnerShowOnIndex(partner.showOnIndex)

  /**
   * external 沒有 section，是由 partner 的 `showOnIndex` 代替：真的算「時事」，
   * 否則算「生活」。
   *
   * 舊版這段推導在 `components/externals/externals-list.js` 裡，從
   * `renderList[0].partner.showOnIndex` 取第 1 筆 item 的 `partner.showOnIndex`。
   * 去抓 gptPageKey
   * 現在列表共用 `ArticleList`，它收的 `ArticleListItemData` 沒有 `partner` 欄位
   * 所以改由還有 partner 的 page 層級，轉成一個 section 傳下去。
   *
   * `slug` 填 `news` / `life` 而不是 partner 自己的 slug，是因為 `ArticleList`
   * 會拿 `section.slug` 去算它那個 `MB_FT` 廣告的單元；填 partner slug 會查不到
   * 而落回 `other`，跟上面 `gptPageKey` 算出來的不一致。
   */
  const section = {
    name: getExternalSectionTitle(partner) ?? '',
    slug: partner.showOnIndex ? 'news' : 'life',
  }

  return (
    <>
      <PageShell
        head={{
          title: `${partner.name} - 文章列表`,
          description: `${partner.name}共發表${externalsCount}篇文章，${SITE_DESCRIPTION}${partner.name}最新發佈相關新聞：${externals[0]?.title}`,
        }}
        headerData={headerData}
      >
        <ListPageMain>
          <GPT_Placeholder
            shouldShowAd={shouldShowAd}
            isLogInProcessFinished={isLogInProcessFinished}
          >
            {shouldShowAd && (
              <GPTAd
                adKey="HD"
                className="h-auto w-full"
                pageKey={gptPageKey}
              />
            )}
          </GPT_Placeholder>

          {partner.name && (
            <Typography
              as="h1"
              variant="h3"
              className="mt-mm-2xl mb-mm-2xl text-mm-base-700 sm:ml-mm-xl md:mx-0 md:mb-mm-3xl xl:mt-mm-3xl xl:mb-mm-l"
            >
              {partner.name}
            </Typography>
          )}

          <div className="flex md:gap-10 xl:gap-6.5">
            {/* The sidebar is gone below lg, so the column centres itself. */}
            <div className="mx-auto w-[calc(100%-464px)] max-w-187.5 flex-1 lg:mx-0">
              <PartnerArticles
                externals={externals}
                externalsCount={externalsCount}
                storyList="author_list"
                partnerSlug={partner.slug}
                renderPageSize={RENDER_PAGE_SIZE}
                section={section}
              />
            </div>

            <ListAsideColumn pageKey={gptPageKey} sectionSlug={section.slug} />
          </div>

          {shouldShowAd && (
            // Above the shell header (--mm-z-shell-header, 1000) and below its
            // overlays, matching the legacy Z_INDEX.coverHeader this ad used.
            <GPTMbStAd
              className="fixed inset-x-0 bottom-0 z-[2000] mx-auto h-auto max-h-[50px] w-full max-w-[320px] xl:hidden"
              pageKey={gptPageKey}
            />
          )}
          {shouldShowAd && <FullScreenAds />}
        </ListPageMain>
      </PageShell>
    </>
  )
}

export const getServerSideProps = (async ({ params, req, res }) => {
  if (ENV === 'prod') {
    setPageCache(
      res,
      {
        cachePolicy: 'max-age',
        cacheTime: 600,
        sharedCacheTime: 600,
        staleWhileRevalidate: 3600,
      },
      req.url
    )
  } else {
    setPageCache(res, { cachePolicy: 'no-store' }, req.url)
  }

  const partnerSlug =
    (Array.isArray(params?.partnerSlug)
      ? params?.partnerSlug[0]
      : params?.partnerSlug) ?? ''

  const globalLogFields: Record<string, unknown> = {
    ...getLogTraceObject(req),
  }

  const [headerData, [externalsResponse, countResponse, partnerResponse]] =
    await Promise.all([
      fetchShellHeaderData({ logFields: globalLogFields }),
      Promise.allSettled([
        fetchExternalsByPartnerSlug(1, RENDER_PAGE_SIZE, partnerSlug),
        client.query({
          query: fetchExternalCounts,
          variables: {
            filter: {
              state: { equals: 'published' },
              partner: { slug: { equals: partnerSlug } },
            },
          },
        }),
        client.query({
          query: fetchPartnerBySlug,
          variables: { slug: partnerSlug },
        }),
      ]),
    ])

  const partnerData = processSettledResult(
    partnerResponse,
    (gqlData) => gqlData?.data?.partners?.[0],
    `Error occurs while getting partners data in externals partner page (partnerSlug: ${partnerSlug})`,
    globalLogFields
  )

  if (!partnerData) {
    console.log(
      JSON.stringify({
        severity: 'WARNING',
        message: `The partner which slug is '${partnerSlug}' does not exist, redirect to 404`,
        globalLogFields,
      })
    )
    return { notFound: true }
  }

  const partner = {
    name: partnerData.name ?? '',
    showOnIndex: partnerData.showOnIndex ?? false,
    slug: partnerData.slug ?? '',
  }

  const externals = processSettledResult(
    externalsResponse,
    (gqlData) => gqlData?.data?.externals ?? [],
    `Error occurs while getting external posts in externals partner page (partnerSlug: ${partnerSlug})`,
    globalLogFields
  ).map(toExternalListItemData)

  const externalsCount = processSettledResult(
    countResponse,
    (gqlData) => gqlData?.data?.externalsCount ?? 0,
    `Error occurs while getting externalsCount in externals partner page (partnerSlug: ${partnerSlug})`,
    globalLogFields
  )

  return {
    props: {
      dataLayer: buildSingleCatDataLayer(partner.name),
      externals,
      externalsCount,
      headerData,
      partner,
    },
  }
}) satisfies GetServerSideProps<ExternalPartnerPageProps>
