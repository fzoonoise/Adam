import { z } from 'zod'

import type { FetchPostsQuery } from '@/apollo/__generated__/content/graphql'
import { DEFAULT_OG_IMAGE_URL } from '@/constants'
import { getArticleHref } from '@/utils'
import { extractYouTubeId } from '@/utils/youtube'
import { logZodMonitorFailure, monitorZodSafeParse } from '@/utils/zod-monitor'

import type { HomepageArticle, HomepageVideo } from './homepage-types'

const namedSlugSchema = z
  .object({
    name: z.string().nullish(),
    slug: z.string().nullish(),
  })
  .passthrough()

const resizedImageSchema = z
  .object({
    original: z.string().nullish(),
    w480: z.string().nullish(),
    w800: z.string().nullish(),
    w1200: z.string().nullish(),
    w1600: z.string().nullish(),
    w2400: z.string().nullish(),
  })
  .partial()

const heroImageSchema = z.union([
  z.string(),
  z
    .object({
      resized: resizedImageSchema.nullish(),
      resizedWebp: resizedImageSchema.nullish(),
    })
    .passthrough(),
  z.null(),
])

const partnerSchema = z.union([
  z.literal(''),
  z
    .object({
      slug: z.string().nullish(),
    })
    .passthrough(),
  z.null(),
])

const homepageArticleInputSchema = z
  .object({
    categories: z.array(namedSlugSchema).nullish(),
    heroImage: heroImageSchema.optional(),
    partner: partnerSchema.optional(),
    publishedDate: z.string().nullish(),
    redirect: z.string().nullish(),
    sections: z.array(namedSlugSchema).nullish(),
    slug: z.string().min(1),
    style: z
      .union([
        z.literal(''),
        z.enum([
          'article',
          'wide',
          'projects',
          'photography',
          'script',
          'campaign',
          'readr',
        ]),
      ])
      .nullish(),
    title: z.string().min(1),
  })
  .passthrough()

const postExternalSchema = z
  .object({
    choices: z.array(z.unknown()).optional().default([]),
    latest: z.array(z.unknown()).optional().default([]),
  })
  .passthrough()

const popularNewsSchema = z.array(z.unknown())

const menuSectionPostSchema = z.object({
  heroImage: z.string().nullish(),
  publishedDate: z.string().min(1),
  slug: z.string().trim().min(1),
  title: z.string().trim().min(1),
})

const menuSectionPostsSchema = z.array(menuSectionPostSchema)

const forumHeadlinesSchema = z
  .object({
    externals: z.array(z.unknown()).optional().default([]),
  })
  .passthrough()

const forumHeadlineInputSchema = z
  .object({
    id: z.string().min(1),
    publishedDate: z.string().nullish(),
    slug: z.string().min(1),
    thumb: z.string().nullish(),
    title: z.string().min(1),
  })
  .passthrough()

const promoteVideosSchema = z
  .object({
    promoteVideos: z.array(z.unknown()).optional().default([]),
  })
  .passthrough()

const promoteVideoInputSchema = z
  .object({
    id: z.string().min(1),
    videoLink: z.string().min(1),
  })
  .passthrough()

type RawHomepageArticle = z.infer<typeof homepageArticleInputSchema>
type GraphqlPost = NonNullable<FetchPostsQuery['posts']>[number]

function getPartnerSlug(partner: RawHomepageArticle['partner']): string {
  return typeof partner === 'object' && partner
    ? partner.slug?.trim() || ''
    : ''
}

function getImageUrl(heroImage: RawHomepageArticle['heroImage']): string {
  if (typeof heroImage === 'string') {
    return heroImage.trim() || DEFAULT_OG_IMAGE_URL
  }

  return (
    heroImage?.resizedWebp?.w800?.trim() ||
    heroImage?.resizedWebp?.w480?.trim() ||
    heroImage?.resizedWebp?.original?.trim() ||
    heroImage?.resized?.w800?.trim() ||
    heroImage?.resized?.w480?.trim() ||
    heroImage?.resized?.original?.trim() ||
    DEFAULT_OG_IMAGE_URL
  )
}

function hasExternalRedirect(redirect: string | null | undefined): boolean {
  const value = redirect?.trim().toLowerCase()

  return Boolean(
    value &&
    (value.startsWith('https://') ||
      value.startsWith('http://') ||
      value.startsWith('www.'))
  )
}

function normalizeArticle(item: RawHomepageArticle): HomepageArticle | null {
  if (hasExternalRedirect(item.redirect)) {
    return null
  }

  const partnerSlug = getPartnerSlug(item.partner)
  const isPartner = typeof item.partner === 'object' && item.partner !== null
  const sections = item.sections ?? []
  const memberSection = sections.find((section) => section.slug === 'member')
  const section = memberSection ?? sections[0]
  const sectionName = isPartner
    ? partnerSlug === 'healthnews'
      ? '生活'
      : '時事'
    : memberSection
      ? '會員專區'
      : section?.name?.trim() || ''
  const style = item.style || 'article'

  return {
    href: getArticleHref(item.slug, style, item.partner ?? ''),
    imageUrl: getImageUrl(item.heroImage),
    key: `${partnerSlug || (isPartner ? 'external' : 'story')}:${style}:${item.slug}`,
    publishedDate: item.publishedDate?.trim() || '',
    sectionName,
    title: item.title,
  }
}

function normalizeArticleList(
  input: unknown[],
  boundary: string
): HomepageArticle[] {
  const articles: HomepageArticle[] = []
  const invalidIssues: z.ZodIssue[] = []
  const seenKeys = new Set<string>()
  let invalidItemCount = 0

  input.forEach((item, index) => {
    const result = homepageArticleInputSchema.safeParse(item)

    if (result.success) {
      const article = normalizeArticle(result.data)
      if (article && !seenKeys.has(article.key)) {
        seenKeys.add(article.key)
        articles.push(article)
      }
      return
    }

    invalidItemCount += 1
    invalidIssues.push(
      ...result.error.issues.map((issue) => ({
        ...issue,
        path: [index, ...issue.path],
      }))
    )
  })

  if (invalidIssues.length) {
    logZodMonitorFailure({
      boundary,
      schemaName: 'homepageArticleInputSchema',
      error: new z.ZodError(invalidIssues),
      debugPayload: { invalidItemCount, totalItemCount: input.length },
    })
  }

  return articles
}

function parsePostExternal(
  input: unknown,
  boundary = 'gcs-static-json:post_external01'
): {
  choices: HomepageArticle[]
  latest: HomepageArticle[]
} | null {
  const result = monitorZodSafeParse(postExternalSchema, input, {
    boundary,
    schemaName: 'postExternalSchema',
  })

  if (!result.success) return null

  return {
    choices: normalizeArticleList(result.data.choices, `${boundary}:choices`),
    latest: normalizeArticleList(result.data.latest, `${boundary}:latest`),
  }
}

function parsePopularNews(input: unknown): HomepageArticle[] | null {
  const result = monitorZodSafeParse(popularNewsSchema, input, {
    boundary: 'gcs-static-json:popular',
    schemaName: 'popularNewsSchema',
  })

  return result.success
    ? normalizeArticleList(result.data, 'gcs-static-json:popular:items')
    : null
}

function parseHomepageCategoryPosts(
  input: unknown,
  sectionName: string,
  sectionSlug: string
): HomepageArticle[] | null {
  const result = monitorZodSafeParse(menuSectionPostsSchema, input, {
    boundary: `gcs-static-json:menu-sections:${sectionSlug}`,
    schemaName: 'menuSectionPostsSchema',
  })

  if (!result.success) return null

  const seenSlugs = new Set<string>()
  return result.data.flatMap((post) => {
    if (seenSlugs.has(post.slug)) return []
    seenSlugs.add(post.slug)

    return [
      {
        href: `/story/${post.slug}/`,
        imageUrl: post.heroImage?.trim() || DEFAULT_OG_IMAGE_URL,
        key: `story:article:${post.slug}`,
        publishedDate: post.publishedDate,
        sectionName,
        title: post.title,
      },
    ]
  })
}

function parseForumHeadlines(input: unknown): HomepageArticle[] | null {
  const result = monitorZodSafeParse(forumHeadlinesSchema, input, {
    boundary: 'gcs-static-json:daily-column',
    schemaName: 'forumHeadlinesSchema',
  })

  if (!result.success) return null

  const articles: HomepageArticle[] = []
  result.data.externals.forEach((item, index) => {
    const itemResult = forumHeadlineInputSchema.safeParse(item)
    if (!itemResult.success) {
      logZodMonitorFailure({
        boundary: 'gcs-static-json:daily-column:items',
        schemaName: 'forumHeadlineInputSchema',
        error: itemResult.error,
        debugPayload: { index },
      })
      return
    }

    articles.push({
      href: getArticleHref(itemResult.data.slug, 'article', {
        slug: 'dailycolumn',
      }),
      imageUrl: itemResult.data.thumb?.trim() || DEFAULT_OG_IMAGE_URL,
      key: `external:daily-column:${itemResult.data.slug}`,
      publishedDate: itemResult.data.publishedDate?.trim() || '',
      sectionName: '論壇',
      title: itemResult.data.title,
    })
  })

  return articles
}

function parsePromoteVideos(input: unknown): HomepageVideo[] | null {
  const result = monitorZodSafeParse(promoteVideosSchema, input, {
    boundary: 'gcs-static-json:promoting-video',
    schemaName: 'promoteVideosSchema',
  })

  if (!result.success) return null

  const videos: HomepageVideo[] = []
  result.data.promoteVideos.forEach((item, index) => {
    const itemResult = promoteVideoInputSchema.safeParse(item)
    if (!itemResult.success) {
      logZodMonitorFailure({
        boundary: 'gcs-static-json:promoting-video:items',
        schemaName: 'promoteVideoInputSchema',
        error: itemResult.error,
        debugPayload: { index },
      })
      return
    }

    const videoId = extractYouTubeId(itemResult.data.videoLink)
    if (!videoId) return

    videos.push({
      id: itemResult.data.id,
      title: `鏡週刊最新影音 ${videos.length + 1}`,
      videoId,
    })
  })

  return videos
}

function normalizeGraphqlPosts(posts: GraphqlPost[] | null): HomepageArticle[] {
  return (posts ?? []).flatMap((post) => {
    if (!post.slug || !post.title) return []

    const section = post.sections?.[0]
    const imageUrl =
      post.heroImage?.resizedWebp?.w800 ||
      post.heroImage?.resizedWebp?.w480 ||
      post.heroImage?.resizedWebp?.original ||
      post.heroImage?.resized?.w800 ||
      post.heroImage?.resized?.w480 ||
      post.heroImage?.resized?.original ||
      DEFAULT_OG_IMAGE_URL

    return [
      {
        href: `/story/${post.slug}/`,
        imageUrl,
        key: `story:article:${post.slug}`,
        publishedDate: post.publishedDate ?? '',
        sectionName: section?.name ?? '',
        title: post.title,
      },
    ]
  })
}

export {
  normalizeGraphqlPosts,
  parseForumHeadlines,
  parseHomepageCategoryPosts,
  parsePopularNews,
  parsePostExternal,
  parsePromoteVideos,
}
