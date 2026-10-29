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
import TagArticles from '@/modules/tag/components/tag-articles'
import { getLogTraceObject } from '@/utils'
import type { ShellHeaderData } from '@/utils/api'
import { fetchShellHeaderData } from '@/utils/api'
import { fetchPostsByTagSlug, fetchTagByTagSlug } from '@/utils/api/tag'
import { setPageCache } from '@/utils/cache-setting'
import { getPostsAndPostscountFromGqlData } from '@/utils/data-process'
import { buildSingleCatDataLayer } from '@/utils/gtm/build-data-layer'
import { processSettledResult } from '@/utils/response-processor'

const GPTAd = dynamic(() => import('@/components/ads/gpt/gpt-ad'), {
  ssr: false,
})

const RENDER_PAGE_SIZE = 12

const DESCRIPTION_MAX_LENGTH = 110

/**
 * 由最新前三篇文章標題組成 description，以 [、] 區隔。超過 110 字元就截斷並補上刪節
 * 號，所以最長 113 字元。
 */
function getTagDescriptionFromLatestPosts(posts: ArticleListItemData[]) {
  const description = posts
    .slice(0, 3)
    .map((post) => post.title.trim())
    .filter(Boolean)
    .join('、')

  return description.length <= DESCRIPTION_MAX_LENGTH
    ? description
    : `${description.slice(0, DESCRIPTION_MAX_LENGTH)}...`
}

type TagPageProps = {
  dataLayer: ReturnType<typeof buildSingleCatDataLayer>
  headerData: ShellHeaderData
  posts: ArticleListItemData[]
  postsCount: number
  tag: { name: string; slug: string }
}

export default function TagPage({
  headerData,
  posts,
  postsCount,
  tag,
}: TagPageProps) {
  const { shouldShowAd, isLogInProcessFinished } = useDisplayAd()

  const latestTitles = getTagDescriptionFromLatestPosts(posts)
  const metaDescription = `搜尋${tag.name}共找到${postsCount}篇新聞－鏡週刊 Mirror Media。最新發佈${tag.name}：${latestTitles}`

  return (
    <>
      <PageShell
        head={{
          title: `${tag.name} - 關鍵字`,
          description: metaDescription,
          ogDescription: metaDescription,
          robotsMetaContent: postsCount < 5 ? 'noindex' : undefined,
          skipCanonical: postsCount < 5,
        }}
        headerData={headerData}
      >
        <ListPageMain>
          <GPT_Placeholder
            shouldShowAd={shouldShowAd}
            isLogInProcessFinished={isLogInProcessFinished}
          >
            {shouldShowAd && (
              <GPTAd adKey="HD" className="h-auto w-full" pageKey="other" />
            )}
          </GPT_Placeholder>

          {tag.name && (
            <Typography
              as="h1"
              variant="h3"
              className="mt-mm-2xl mb-mm-2xl text-mm-base-700 sm:ml-mm-xl md:mx-0 md:mb-mm-3xl xl:mt-mm-3xl xl:mb-mm-l"
            >
              {tag.name}
            </Typography>
          )}

          <div className="flex md:gap-10 xl:gap-6.5">
            {/* The sidebar is gone below lg, so the column centres itself. */}
            <div className="mx-auto w-[calc(100%-464px)] max-w-187.5 flex-1 lg:mx-0">
              <TagArticles
                storyList="tagging_list"
                posts={posts}
                postsCount={postsCount}
                renderPageSize={RENDER_PAGE_SIZE}
                tagSlug={tag.slug}
              />
            </div>

            <ListAsideColumn pageKey="other" sectionSlug="" />
          </div>

          {shouldShowAd && (
            // Above the shell header (--mm-z-shell-header, 1000) and below its
            // overlays, matching the legacy Z_INDEX.coverHeader this ad used.
            <GPTMbStAd
              className="fixed inset-x-0 bottom-0 z-[2000] mx-auto h-auto max-h-[50px] w-full max-w-[320px] xl:hidden"
              pageKey="other"
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

  const tagSlug = (Array.isArray(query.slug) ? query.slug[0] : query.slug) ?? ''

  const globalLogFields: Record<string, unknown> = {
    ...getLogTraceObject(req),
  }

  const [headerData, [tagResponse, postsResponse]] = await Promise.all([
    fetchShellHeaderData({ logFields: globalLogFields }),
    Promise.allSettled([
      fetchTagByTagSlug(tagSlug),
      fetchPostsByTagSlug(tagSlug, RENDER_PAGE_SIZE * 2, 0),
    ]),
  ])

  const tagData = processSettledResult(
    tagResponse,
    (gqlData) => gqlData?.data,
    `Error occurs while getting tag data in tag page (tagSlug: ${tagSlug})`,
    globalLogFields
  )

  if (!tagData) {
    throw new Error('fetch tag failed')
  }

  if (!tagData.tag) {
    console.log(
      JSON.stringify({
        severity: 'WARNING',
        message: `The tag which slug is '${tagSlug}' does not exist, redirect to 404`,
        globalLogFields,
      })
    )
    return { notFound: true }
  }

  const tag = {
    name: tagData.tag.name ?? '',
    slug: tagData.tag.slug ?? '',
  }

  const [postsCount, postsResult] = processSettledResult(
    postsResponse,
    getPostsAndPostscountFromGqlData<ArticleListItemSource>,
    `Error occurs while getting post data in tag page (tagSlug: ${tagSlug})`,
    globalLogFields
  )

  const posts = postsResult.map(toArticleListItemData)

  if (posts.length === 0) {
    // fetchPost return empty array -> 404
    console.log(
      JSON.stringify({
        severity: 'WARNING',
        message: `fetch post of tagSlug ${tagSlug} return empty posts, redirect to 404`,
        globalLogFields,
      })
    )
    return { notFound: true }
  }

  return {
    props: {
      dataLayer: buildSingleCatDataLayer(tag.name),
      headerData,
      posts,
      postsCount,
      tag,
    },
  }
}) satisfies GetServerSideProps<TagPageProps>
