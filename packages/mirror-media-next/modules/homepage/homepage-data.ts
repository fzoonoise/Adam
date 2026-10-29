import type {
  FetchLatestPublishedExternalsQuery,
  FetchPromoteVideosQuery,
} from '@/apollo/__generated__/content/graphql'
import client from '@/apollo/apollo-client'
import { fetchLatestPublishedExternals } from '@/apollo/query/externals'
import { fetchPromoteVideos } from '@/apollo/query/promote-videos'
import {
  API_TIMEOUT,
  URL_STATIC_DAILY_COLUMN_HEADLINES,
  URL_STATIC_POPULAR_NEWS,
  URL_STATIC_POST_EXTERNAL,
  URL_STATIC_PROMOTE_VIDEOS,
} from '@/config/index.mjs'
import type { ShellSectionPosts } from '@/utils/api'
import { fetchStaticJsonByUrl } from '@/utils/api'
import { fetchPostsBySectionSlug } from '@/utils/api/section'
import { processSettledResult } from '@/utils/response-processor'

import {
  HOMEPAGE_CATEGORY_ARTICLE_COUNT,
  HOMEPAGE_EDITOR_CHOICE_COUNT,
  HOMEPAGE_FORUM_NEWS_COUNT,
  HOMEPAGE_LATEST_NEWS_COUNT,
  HOMEPAGE_MORE_NEWS_BATCH_SIZE,
  HOMEPAGE_POPULAR_NEWS_COUNT,
  HOMEPAGE_PROMO_VIDEO_COUNT,
} from './homepage-constants'
import {
  normalizeGraphqlPosts,
  parseForumHeadlines,
  parseHomepageCategoryPosts,
  parsePopularNews,
  parsePostExternal,
  parsePromoteVideos,
} from './homepage-static-json.schema'
import type {
  HomepageArticle,
  HomepageCategory,
  HomepageVideo,
  HomepageViewModel,
} from './homepage-types'

const CATEGORY_CONFIG = [
  { href: '/section/entertainment', name: '娛樂', slug: 'entertainment' },
  { href: '/section/politicsocial', name: '政治社會', slug: 'politicsocial' },
  { href: '/section/businessmoney', name: '財經理財', slug: 'businessmoney' },
  { href: '/section/people', name: '人物', slug: 'people' },
  { href: '/section/foodtravel', name: '美旅', slug: 'foodtravel' },
  { href: '/section/life', name: '生活', slug: 'life' },
] as const

const STATIC_JSON_TIMEOUT = { timeout: 5000 }

async function fetchHomepagePostExternal() {
  const response = await fetchStaticJsonByUrl<unknown>(
    `${URL_STATIC_POST_EXTERNAL}01.json`,
    STATIC_JSON_TIMEOUT
  )
  const parsed = parsePostExternal(response.data)

  if (!parsed) {
    throw new Error('Homepage post_external01 schema validation failed')
  }

  return parsed
}

async function fetchHomepagePopularNews(): Promise<HomepageArticle[]> {
  const response = await fetchStaticJsonByUrl<unknown>(
    URL_STATIC_POPULAR_NEWS,
    { timeout: API_TIMEOUT }
  )
  const parsed = parsePopularNews(response.data)

  if (!parsed) {
    throw new Error('Homepage popular news schema validation failed')
  }

  return parsed.slice(0, HOMEPAGE_POPULAR_NEWS_COUNT)
}

async function fetchHomepageForumNews(
  logFields?: Record<string, unknown>
): Promise<HomepageArticle[]> {
  try {
    const response = await fetchStaticJsonByUrl<unknown>(
      URL_STATIC_DAILY_COLUMN_HEADLINES,
      { timeout: API_TIMEOUT }
    )
    const parsed = parseForumHeadlines(response.data)

    if (parsed !== null) return parsed.slice(0, HOMEPAGE_FORUM_NEWS_COUNT)
  } catch (error) {
    console.warn(
      JSON.stringify({
        ...(logFields ?? {}),
        severity: 'WARNING',
        message:
          'Failed to fetch homepage forum static JSON; using GraphQL fallback',
        error: error instanceof Error ? error.message : String(error),
      })
    )
  }

  const response = await client.query<FetchLatestPublishedExternalsQuery>({
    query: fetchLatestPublishedExternals,
    variables: {
      partnerSlug: 'dailycolumn',
      take: HOMEPAGE_FORUM_NEWS_COUNT,
    },
  })
  const parsed = parseForumHeadlines({
    externals: response.data.externals ?? [],
  })

  return (parsed ?? []).slice(0, HOMEPAGE_FORUM_NEWS_COUNT)
}

async function fetchHomepagePromoVideos(
  logFields?: Record<string, unknown>
): Promise<HomepageVideo[]> {
  try {
    const response = await fetchStaticJsonByUrl<unknown>(
      URL_STATIC_PROMOTE_VIDEOS,
      { timeout: API_TIMEOUT }
    )
    const parsed = parsePromoteVideos(response.data)

    if (parsed !== null) return parsed.slice(0, HOMEPAGE_PROMO_VIDEO_COUNT)
  } catch (error) {
    console.warn(
      JSON.stringify({
        ...(logFields ?? {}),
        severity: 'WARNING',
        message:
          'Failed to fetch homepage video static JSON; using GraphQL fallback',
        error: error instanceof Error ? error.message : String(error),
      })
    )
  }

  const response = await client.query<FetchPromoteVideosQuery>({
    query: fetchPromoteVideos,
    variables: {
      orderBy: [{ order: 'asc' }],
      take: HOMEPAGE_PROMO_VIDEO_COUNT,
    },
  })
  const parsed = parsePromoteVideos({
    promoteVideos: response.data.promoteVideos ?? [],
  })

  return (parsed ?? []).slice(0, HOMEPAGE_PROMO_VIDEO_COUNT)
}

async function fetchHomepageCategories(
  logFields: Record<string, unknown> | undefined,
  sectionPostsPromise: Promise<ShellSectionPosts>
): Promise<HomepageCategory[]> {
  const sectionPosts = await sectionPostsPromise.catch(
    (): ShellSectionPosts => ({})
  )

  const responses = await Promise.allSettled(
    CATEGORY_CONFIG.map(async (category) => {
      const posts = sectionPosts[category.slug]
      const articles = posts
        ? parseHomepageCategoryPosts(posts, category.name, category.slug)
        : null

      if (articles && articles.length >= HOMEPAGE_CATEGORY_ARTICLE_COUNT) {
        return {
          ...category,
          articles: articles.slice(0, HOMEPAGE_CATEGORY_ARTICLE_COUNT),
        }
      }

      const response = await fetchPostsBySectionSlug(
        category.slug,
        HOMEPAGE_CATEGORY_ARTICLE_COUNT,
        0
      )
      return {
        ...category,
        articles: normalizeGraphqlPosts(response.data.posts).slice(
          0,
          HOMEPAGE_CATEGORY_ARTICLE_COUNT
        ),
      }
    })
  )

  return responses.flatMap((response, index) => {
    if (response.status === 'fulfilled') return [response.value]

    console.warn(
      JSON.stringify({
        ...(logFields ?? {}),
        severity: 'WARNING',
        message: 'Failed to fetch homepage category posts',
        category: CATEGORY_CONFIG[index]?.slug,
        error:
          response.reason instanceof Error
            ? response.reason.message
            : String(response.reason),
      })
    )
    return []
  })
}

/**
 * Consumes the route's shared menu-feed promise instead of fetching it again.
 * The route shares an empty map after a logged fetch failure; rejected inputs
 * also fall back to GraphQL at the category data boundary.
 */
async function fetchHomepageData(
  logFields: Record<string, unknown> | undefined,
  sectionPostsPromise: Promise<ShellSectionPosts>
): Promise<HomepageViewModel> {
  const [postResult, popularResult, forumResult, videoResult, categoryResult] =
    await Promise.allSettled([
      fetchHomepagePostExternal(),
      fetchHomepagePopularNews(),
      fetchHomepageForumNews(logFields),
      fetchHomepagePromoVideos(logFields),
      fetchHomepageCategories(logFields, sectionPostsPromise),
    ])

  const postData = processSettledResult(
    postResult,
    (value) => value,
    'Error occurs while getting homepage post external data',
    logFields
  )
  const popularNews = processSettledResult(
    popularResult,
    (value) => value ?? [],
    'Error occurs while getting homepage popular news',
    logFields
  )
  const forumNews = processSettledResult(
    forumResult,
    (value) => value ?? [],
    'Error occurs while getting homepage forum news',
    logFields
  )
  const promoVideos = processSettledResult(
    videoResult,
    (value) => value ?? [],
    'Error occurs while getting homepage promo videos',
    logFields
  )
  const categories = processSettledResult(
    categoryResult,
    (value) => value ?? [],
    'Error occurs while getting homepage category posts',
    logFields
  )
  const latestArticles = postData?.latest ?? []
  const initialMoreNewsEnd =
    HOMEPAGE_LATEST_NEWS_COUNT + HOMEPAGE_MORE_NEWS_BATCH_SIZE
  // Files 02-04 are discovered client-side, so any valid file01 content keeps
  // the load-more path available until the client confirms exhaustion.
  const hasMoreNews = latestArticles.length > 0

  return {
    categories,
    editorChoices:
      postData?.choices.slice(0, HOMEPAGE_EDITOR_CHOICE_COUNT) ?? [],
    forumNews,
    hasMoreNews,
    latestNews: latestArticles.slice(0, HOMEPAGE_LATEST_NEWS_COUNT),
    moreNews: latestArticles.slice(
      HOMEPAGE_LATEST_NEWS_COUNT,
      initialMoreNewsEnd
    ),
    popularNews,
    promoVideos,
  }
}

export {
  fetchHomepageData,
  fetchHomepageForumNews,
  fetchHomepagePopularNews,
  fetchHomepagePostExternal,
  fetchHomepagePromoVideos,
}
