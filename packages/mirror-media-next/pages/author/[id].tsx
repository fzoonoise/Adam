import type { GetServerSideProps } from 'next'
import dynamic from 'next/dynamic'

import FullScreenAds from '@/components/ads/full-screen-ads'
import GPTMbStAd from '@/components/ads/gpt/gpt-mb-st-ad'
import { GPT_Placeholder } from '@/components/ads/gpt/gpt-placeholder'
import { PageShell } from '@/components/shell/page-shell'
import { Typography } from '@/components/ui/typography'
import { ENV } from '@/config/index.mjs'
import { SITE_DESCRIPTION } from '@/constants'
import { useDisplayAd } from '@/hooks/useDisplayAd'
import { ListAsideColumn } from '@/modules/aside/components/list-aside-column'
import AuthorArticles from '@/modules/author/components/author-articles'
import { ListPageMain } from '@/modules/list-article/components/list-page-main'
import {
  type ArticleListItemSource,
  toArticleListItemData,
} from '@/modules/list-article/list-article-data'
import type { ArticleListItemData } from '@/modules/list-article/list-article-types'
import { getLogTraceObject } from '@/utils'
import type { ShellHeaderData } from '@/utils/api'
import { fetchShellHeaderData } from '@/utils/api'
import { fetchAuthorByAuthorId, fetchPostsByAuthorId } from '@/utils/api/author'
import { setPageCache } from '@/utils/cache-setting'
import { getPostsAndPostscountFromGqlData } from '@/utils/data-process'
import { buildSingleCatDataLayer } from '@/utils/gtm/build-data-layer'
import { processSettledResult } from '@/utils/response-processor'

const GPTAd = dynamic(() => import('@/components/ads/gpt/gpt-ad'), {
  ssr: false,
})

const RENDER_PAGE_SIZE = 12

type AuthorPageProps = {
  author: { id: string; name: string }
  dataLayer: ReturnType<typeof buildSingleCatDataLayer>
  headerData: ShellHeaderData
  posts: ArticleListItemData[]
  postsCount: number
}

export default function AuthorPage({
  author,
  headerData,
  posts,
  postsCount,
}: AuthorPageProps) {
  const { shouldShowAd, isLogInProcessFinished } = useDisplayAd()

  return (
    <>
      <PageShell
        head={{
          title: `${author.name} - 文章列表`,
          description: `${author.name}共發表${postsCount}篇文章，${SITE_DESCRIPTION}${author.name}最新發佈相關新聞：${posts[0]?.title}`,
          // A page this thin is not worth indexing.
          robotsMetaContent:
            posts.length <= 3 ? 'noindex, nofollow' : undefined,
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

          {author.name && (
            <Typography
              as="h1"
              variant="h3"
              className="mt-mm-2xl mb-mm-2xl text-mm-base-700 sm:ml-mm-xl md:mx-0 md:mb-mm-3xl xl:mt-mm-3xl xl:mb-mm-l"
            >
              {author.name}
            </Typography>
          )}

          <div className="flex md:gap-10 xl:gap-6.5">
            {/* The sidebar is gone below lg, so the column centres itself. */}
            <div className="mx-auto w-[calc(100%-464px)] max-w-187.5 flex-1 lg:mx-0">
              <AuthorArticles
                authorId={author.id}
                storyList="author_list"
                posts={posts}
                postsCount={postsCount}
                renderPageSize={RENDER_PAGE_SIZE}
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

  const authorId = (Array.isArray(query.id) ? query.id[0] : query.id) ?? ''

  //When `authorId` is not only numeric, redirect to the '/'.
  if (!/^\d+$/.test(authorId)) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  const globalLogFields: Record<string, unknown> = {
    ...getLogTraceObject(req),
  }

  const [headerData, [authorResponse, postsResponse]] = await Promise.all([
    fetchShellHeaderData({ logFields: globalLogFields }),
    Promise.allSettled([
      fetchAuthorByAuthorId(authorId),
      fetchPostsByAuthorId(authorId, RENDER_PAGE_SIZE * 2, 0),
    ]),
  ])

  const authorData = processSettledResult(
    authorResponse,
    (gqlData) => gqlData?.data,
    `Error occurs while getting author data in author page (authorId: ${authorId})`,
    globalLogFields
  )

  if (!authorData) {
    throw new Error('fetch author failed')
  }

  if (!authorData.contact) {
    console.log(
      JSON.stringify({
        severity: 'WARNING',
        message: `The author which id is '${authorId}' does not exist, redirect to 404`,
        globalLogFields,
      })
    )
    return { notFound: true }
  }

  const author = {
    id: authorData.contact.id,
    name: authorData.contact.name ?? '',
  }

  const [postsCount, postsResult] = processSettledResult(
    postsResponse,
    getPostsAndPostscountFromGqlData<ArticleListItemSource>,
    `Error occurs while getting post data in author page (authorId: ${authorId})`,
    globalLogFields
  )

  const posts = postsResult.map(toArticleListItemData)

  if (posts.length === 0) {
    // fetchPost return empty array -> 404
    console.log(
      JSON.stringify({
        severity: 'WARNING',
        message: `fetch post of authorId ${authorId} return empty posts, redirect to 404`,
        globalLogFields,
      })
    )
    return { notFound: true }
  }

  return {
    props: {
      author,
      dataLayer: buildSingleCatDataLayer(author.name),
      headerData,
      posts,
      postsCount,
    },
  }
}) satisfies GetServerSideProps<AuthorPageProps>
