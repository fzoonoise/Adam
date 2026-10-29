import type { GetServerSideProps } from 'next'
import dynamic from 'next/dynamic'

import FullScreenAds from '@/components/ads/full-screen-ads'
import GPTMbStAd from '@/components/ads/gpt/gpt-mb-st-ad'
import { GPT_Placeholder } from '@/components/ads/gpt/gpt-placeholder'
import { PageShell } from '@/components/shell/page-shell'
import { Typography } from '@/components/ui/typography'
import { ENV } from '@/config/index.mjs'
import { useDisplayAd } from '@/hooks/useDisplayAd'
import { ListAsideColumn } from '@/modules/aside/components/list-aside-column'
import { ListPageMain } from '@/modules/list-article/components/list-page-main'
import {
  type ArticleListItemSource,
  toArticleListItemData,
} from '@/modules/list-article/list-article-data'
import type { ArticleListItemData } from '@/modules/list-article/list-article-types'
import SectionArticles from '@/modules/section/components/section-articles'
import { getLogTraceObject } from '@/utils'
import { getSectionGPTPageKey } from '@/utils/ad'
import type { ShellHeaderData } from '@/utils/api'
import { fetchShellHeaderData } from '@/utils/api'
import {
  fetchPostsBySectionSlug,
  fetchSectionBySectionSlug,
} from '@/utils/api/section'
import { setPageCache } from '@/utils/cache-setting'
import { getPostsAndPostscountFromGqlData } from '@/utils/data-process'
import { buildSingleCatDataLayer } from '@/utils/gtm/build-data-layer'
import { processSettledResult } from '@/utils/response-processor'

const GPTAd = dynamic(() => import('@/components/ads/gpt/gpt-ad'), {
  ssr: false,
})

const RENDER_PAGE_SIZE = 12

type SectionPageProps = {
  dataLayer: ReturnType<typeof buildSingleCatDataLayer>
  headerData: ShellHeaderData
  posts: ArticleListItemData[]
  postsCount: number
  section: { name: string; slug: string }
}

export default function SectionPage({
  headerData,
  posts,
  postsCount,
  section,
}: SectionPageProps) {
  const { shouldShowAd, isLogInProcessFinished } = useDisplayAd()

  const gptPageKey = getSectionGPTPageKey(section.slug)

  return (
    <>
      <PageShell
        head={{ title: section.name }}
        headerData={{ ...headerData, activeNavigationSlug: section.slug }}
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

          {section.name && (
            <Typography
              as="h1"
              variant="h3"
              className="mt-mm-2xl mb-mm-2xl text-mm-base-700 sm:ml-mm-xl md:mx-0 md:mb-mm-3xl xl:mt-mm-3xl xl:mb-mm-l"
            >
              {section.name}
            </Typography>
          )}

          <div className="flex md:gap-10 xl:gap-6.5">
            <div className="mx-auto w-[calc(100%-464px)] max-w-187.5 flex-1 lg:mx-0">
              <SectionArticles
                storyList="cate_list"
                posts={posts}
                postsCount={postsCount}
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

export const getServerSideProps = (async ({ query, req, res }) => {
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

  const sectionSlug =
    (Array.isArray(query.slug) ? query.slug[0] : query.slug) ?? ''

  const globalLogFields: Record<string, unknown> = {
    ...getLogTraceObject(req),
  }

  const [headerData, [postsResponse, sectionResponse]] = await Promise.all([
    fetchShellHeaderData({ logFields: globalLogFields }),
    Promise.allSettled([
      fetchPostsBySectionSlug(sectionSlug, RENDER_PAGE_SIZE * 2, 0),
      fetchSectionBySectionSlug(sectionSlug),
    ]),
  ])

  const [postsCount, postsResult] = processSettledResult(
    postsResponse,
    getPostsAndPostscountFromGqlData<ArticleListItemSource>,
    `Error occurs while getting posts in section page (sectionSlug: ${sectionSlug})`,
    globalLogFields
  )

  const posts = postsResult.map(toArticleListItemData)

  if (posts.length === 0) {
    // fetchPost return empty array -> 404
    console.log(
      JSON.stringify({
        severity: 'WARNING',
        message: `fetch post of sectionSlug ${sectionSlug} return empty posts, redirect to 404`,
        globalLogFields,
      })
    )
    return { notFound: true }
  }

  const sectionData = processSettledResult(
    sectionResponse,
    (gqlData) => gqlData?.data,
    `Error occurs while getting section data in section page (sectionSlug: ${sectionSlug})`,
    globalLogFields
  )

  if (!sectionData) {
    throw new Error('fetch section failed')
  }

  // An unknown slug leaves `section` null, which reaches 404 the same way an
  // inactive one does.
  if (sectionData.section?.state !== 'active') {
    console.log(
      JSON.stringify({
        severity: 'WARNING',
        message: `sectionSlug '${sectionSlug}' is inactive, redirect to 404`,
        globalLogFields,
      })
    )
    return { notFound: true }
  }

  const section = {
    name: sectionData.section.name ?? '',
    slug: sectionData.section.slug ?? '',
  }

  return {
    props: {
      dataLayer: buildSingleCatDataLayer(section.name),
      headerData,
      posts,
      postsCount,
      section,
    },
  }
}) satisfies GetServerSideProps<SectionPageProps>
