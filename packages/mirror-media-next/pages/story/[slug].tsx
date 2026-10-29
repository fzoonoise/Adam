//TODO: add component to add html head dynamically, not jus write head in every pag
import { useMemo } from 'react'
import type { GetServerSideProps } from 'next'
import dynamic from 'next/dynamic'
import NextImage from 'next/image'
import MirrorMedia from '@mirrormedia/lilith-draft-renderer/lib/website/mirrormedia'

import FullScreenAds from '@/components/ads/full-screen-ads'
import GptAd from '@/components/ads/gpt/gpt-ad'
import GPTFloatingAd from '@/components/ads/gpt/gpt-floating-ad'
import GPTMbStAd from '@/components/ads/gpt/gpt-mb-st-ad'
import {
  GPT_Placeholder,
  GPT_Placeholder_Aside,
} from '@/components/ads/gpt/gpt-placeholder'
import UserBehaviorLogger from '@/components/shared/user-behavior-logger'
import WineWarning from '@/components/shared/wine-warning'
import ArticleQuestions from '@/components/shell/article/article-questions'
import { NextUpPosts } from '@/components/shell/article/next-up-posts'
import { ArticleSummary } from '@/components/shell/article/post-summary'
import { PageShell } from '@/components/shell/page-shell'
import { generateJsonLdsData } from '@/components/story/shared/json-lds-data'
import JsonLdsScript from '@/components/story/shared/json-lds-script'
import StoryHead from '@/components/story/shared/story-head'
import { ENV } from '@/config/index.mjs'
import { useDisplayAd } from '@/hooks/useDisplayAd'
import { FbPagePlugin } from '@/modules/aside/components/fb-page-plugin'
import { GoogleNewsFollow } from '@/modules/aside/components/google-news-follow'
import { LatestArticles } from '@/modules/aside/components/latest-articles'
import { PopularArticles } from '@/modules/aside/components/popular-articles'
import { fetchStoryPost, getStoryLayoutType } from '@/modules/story/story-data'
import type {
  PostContent,
  RelatedStory,
  StoryLayoutType,
  StoryPost,
} from '@/modules/story/story-types'
import { useLoadMoreRelatedStories } from '@/modules/story/use-load-more-related-stories'
import Skeleton from '@/public/images-next/skeleton.png'
import type { StoryDataLayer } from '@/types/dataLayer'
import {
  convertDraftToText,
  getActiveOrderSection,
  getCategoryOfWineSlug,
  getLogTraceObject,
  getResizedUrl,
} from '@/utils'
import { getSectionGPTPageKey } from '@/utils/ad'
import type { ShellHeaderData } from '@/utils/api'
import { fetchShellHeaderData } from '@/utils/api'
import { setPageCache } from '@/utils/cache-setting'
import { buildStoryDataLayer } from '@/utils/gtm/build-data-layer'
import { logGqlError } from '@/utils/log/shared'
import { handleStoryPageRedirect } from '@/utils/story'
import {
  getInitialRelatedStories,
  serializeStoryPostDataForClient,
} from '@/utils/story-page-props.mjs'

const { hasContentInRawContentBlock } = MirrorMedia

const classNameForGTM = 'GTM-story-page-view'

const AdultOnlyWarning = dynamic(
  () => import('@/components/story/shared/adult-only-warning')
)
const StoryWideStyle = dynamic(() => import('@/components/story/wide'), {
  loading: () => (
    <div className="fixed mx-auto my-0 h-full w-full">
      <NextImage
        src={Skeleton}
        alt="loading..."
        width={20}
        height={20}
        className="mx-auto my-0"
      />
    </div>
  ),
})
const StoryPhotographyStyle = dynamic(
  () => import('@/components/story/photography'),
  {
    loading: () => (
      <div className="fixed mx-auto my-0 h-full w-full">
        <NextImage
          src={Skeleton}
          alt="loading..."
          width={20}
          height={20}
          className="mx-auto my-0"
        />
      </div>
    ),
  }
)
const PostLayout = dynamic(
  () => import('@/components/shell/article/post-layout'),
  {
    loading: () => (
      <div className="fixed mx-auto my-0 h-full w-full">
        <NextImage
          src={Skeleton}
          alt="loading..."
          width={20}
          height={20}
          className="mx-auto my-0"
        />
      </div>
    ),
  }
)
const MisoPageView = dynamic(() => import('@/components/miso-pageview'), {
  ssr: false,
})

const DableAd = dynamic(() => import('@/components/common/dable-ad'), {
  ssr: false,
})

type StoryPageProps = {
  postData: StoryPost
  initialRelatedStories: RelatedStory[]
  headerData: ShellHeaderData
  storyLayoutType: StoryLayoutType
  jsonLdData: object[]
  dataLayer: StoryDataLayer
}

export default function Story({
  postData,
  initialRelatedStories = [],
  headerData,
  storyLayoutType,
  jsonLdData,
}: StoryPageProps) {
  const {
    title,
    slug,
    isAdult,
    categories,
    content,
    hiddenAdvertised,
    writers,
  } = postData
  const postContent: PostContent = {
    type: 'fullContent',
    data: content ?? { blocks: [], entityMap: {} },
    isLoaded: true,
  }

  const { shouldShowAd, isLogInProcessFinished } = useDisplayAd(
    hiddenAdvertised ?? false
  )

  const allRelatedStories = useLoadMoreRelatedStories(
    slug ?? '',
    initialRelatedStories
  )
  const [firstRelativeStory, ...restOfRelativeStories] = allRelatedStories

  const writersInString = useMemo(() => {
    return (writers ?? [])
      .map((writer) => {
        return writer?.name ?? ''
      })
      .join(',')
  }, [writers])

  const nonNullCategories = (categories ?? []).filter(
    (category): category is NonNullable<typeof category> => category != null
  )
  //If no wine category, then should show gpt ST ad, otherwise, then should not show gpt ST ad.
  const noCategoryOfWineSlug =
    getCategoryOfWineSlug(nonNullCategories).length === 0

  // Ads are keyed by the story's own section (matching StoryNormalStyle),
  // not by any partner concept — Post has no `partner` field.
  const sectionsWithOrdered = getActiveOrderSection(
    postData.sections,
    postData.sectionsInInputOrder
  )
  const [section] = sectionsWithOrdered
  const pageKeyForGptAd = getSectionGPTPageKey(section?.slug ?? '')

  return (
    <>
      <StoryHead postData={postData} />
      <PageShell
        head={{
          // StoryHead owns robots. utm/fbclid still noindex there.
          robotsMetaContent: null,
          title: `${title ?? ''}`,
          ogTitle: postData.og_title ?? undefined,
          description:
            convertDraftToText(postData.brief) ||
            convertDraftToText(postData.content),
          ogDescription: postData.og_description ?? undefined,
          imageUrl:
            getResizedUrl(postData.heroImage?.resized) ||
            getResizedUrl(postData.og_image?.resized),
          ogImageUrl:
            getResizedUrl(postData.og_image?.resized) ||
            getResizedUrl(postData.heroImage?.resized),
          skipCanonical: true,
          pageType: 'story',
          pageSlug: slug ?? '',
        }}
        headerData={headerData}
      >
        <MisoPageView productIds={`story_${slug ?? ''}`} />
        <UserBehaviorLogger writers={writersInString} />
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
        {storyLayoutType === 'style-normal' && (
          <>
            <PostLayout
              {...postData}
              relativeStory={firstRelativeStory}
              renderAdInContent={() => (
                <GPT_Placeholder
                  displayAt="desktop"
                  rwd={{
                    mobile: { width: '100%', height: 'auto', margin: '0' },
                    tablet: { width: '100%', height: 'auto', margin: '0' },
                    // 內文欄比預設 970px 窄，用滿寬才能把 640px 素材置中
                    desktop: {
                      width: '100%',
                      height: 'auto',
                      margin: '32px auto',
                    },
                  }}
                  shouldShowAd={shouldShowAd}
                  isLogInProcessFinished={isLogInProcessFinished}
                >
                  {shouldShowAd && (
                    <GptAd
                      pageKey={pageKeyForGptAd}
                      adKey="PC_AT1"
                      className="mx-auto block h-auto w-fit"
                    />
                  )}
                </GPT_Placeholder>
              )}
              renderMbAdInContent={(adKey) =>
                shouldShowAd ? (
                  <GptAd
                    pageKey={pageKeyForGptAd}
                    adKey={adKey}
                    className="mt-8 h-auto w-full"
                  />
                ) : null
              }
              renderAdBelowRelated={() =>
                shouldShowAd ? (
                  <GptAd
                    pageKey={pageKeyForGptAd}
                    adKey="MB_AT3"
                    className="order-10 col-span-full mx-[-20px] block h-auto w-full min-[336px]:mx-auto xl:hidden"
                  />
                ) : null
              }
              renderAside={(summary) => (
                <>
                  <GPT_Placeholder_Aside
                    shouldShowAd={shouldShowAd}
                    isLogInProcessFinished={isLogInProcessFinished}
                  >
                    {shouldShowAd && (
                      <GptAd
                        pageKey={pageKeyForGptAd}
                        adKey="PC_R1"
                        className="hidden xl:mx-auto xl:block xl:h-auto xl:w-full"
                      />
                    )}
                  </GPT_Placeholder_Aside>
                  {summary && Array.isArray(summary) && summary.length > 0 && (
                    <ArticleSummary items={summary} />
                  )}
                  <LatestArticles sectionSlug={section?.slug ?? 'news'} />
                  <div className="sticky top-12 space-y-6">
                    <GPT_Placeholder_Aside
                      shouldShowAd={shouldShowAd}
                      isLogInProcessFinished={isLogInProcessFinished}
                    >
                      {shouldShowAd && (
                        <GptAd
                          pageKey={pageKeyForGptAd}
                          adKey="PC_R2"
                          className="hidden xl:mx-auto xl:my-5 xl:block xl:h-auto xl:w-full"
                        />
                      )}
                    </GPT_Placeholder_Aside>
                    <PopularArticles placement="article" />
                    <ArticleQuestions
                      auto_faq={postData.auto_faq}
                      faqs_algo={postData.faqs_algo}
                    />
                    <GoogleNewsFollow />
                    <FbPagePlugin width={424} />
                  </div>
                </>
              )}
              renderNextUp={() => (
                <NextUpPosts
                  hiddenAdvertised={hiddenAdvertised ?? false}
                  items={restOfRelativeStories}
                />
              )}
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

            {shouldShowAd && (
              <GptAd
                pageKey={pageKeyForGptAd}
                adKey="MB_E1"
                className="mx-auto my-6 block h-auto w-full xl:hidden"
              />
            )}
            {shouldShowAd && section?.slug === 'carandwatch' && (
              <GPTFloatingAd pageKey={pageKeyForGptAd} />
            )}
          </>
        )}
        {storyLayoutType === 'style-photography' && (
          <StoryPhotographyStyle
            postData={postData}
            postContent={postContent}
            classNameForGTM={classNameForGTM}
            allRelatedStories={allRelatedStories}
          />
        )}
        {storyLayoutType === 'style-wide' && (
          <StoryWideStyle
            postData={postData}
            postContent={postContent}
            classNameForGTM={classNameForGTM}
            allRelatedStories={allRelatedStories}
          />
        )}
        <WineWarning categories={nonNullCategories} />
        {isAdult && <AdultOnlyWarning isAdult={true} />}
        {noCategoryOfWineSlug && (
          <FullScreenAds hiddenAdvertised={hiddenAdvertised ?? false} />
        )}
        {shouldShowAd && (
          <GptAd
            pageKey={pageKeyForGptAd}
            adKey="FT"
            className="mx-auto my-5"
          />
        )}
        {shouldShowAd && noCategoryOfWineSlug && (
          <GPTMbStAd
            pageKey={pageKeyForGptAd}
            className="fixed right-0 bottom-0 left-0 z-2000 mx-auto block h-auto w-full xl:hidden"
          />
        )}
      </PageShell>
      <JsonLdsScript jsonLdData={jsonLdData} />
    </>
  )
}

export const getServerSideProps: GetServerSideProps<
  StoryPageProps,
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

  try {
    const postData = await fetchStoryPost(slug)

    if (!postData) {
      return { notFound: true }
    }
    const { style } = postData
    /**
     * If post style is 'projects' or '', redirect to certain route.
     *
     * There is no `/projects` or `/campaign` pages in mirror-media-next, when user enter path `/projects/_slug` or `/campaign`,
     * Load balancer hosted by Google Cloud Platform will help us to get page content of project or campaign page.
     * The content of certain page is placed at Google Cloud Storage.
     */
    if (style === 'projects' || style === 'campaign') {
      return {
        redirect: {
          destination: `/${style}/${slug} `,
          permanent: false,
        },
      }
    }

    // Check if the post data has content in the brief or content fields
    const shouldCheckHasContent =
      style === 'article' || style === 'wide' || style === 'photography'

    if (shouldCheckHasContent) {
      const hasBrief = hasContentInRawContentBlock(postData.brief)
      const hasFullContent = hasContentInRawContentBlock(postData.content)

      // If none of the fields have content, return notFound as true
      if (!hasBrief && !hasFullContent) {
        return { notFound: true }
      }
    }

    if (postData.redirect) {
      const redirectResult = handleStoryPageRedirect(postData.redirect)
      if (redirectResult) {
        return redirectResult
      }
    }

    const storyLayoutType = getStoryLayoutType(style)
    const headerData = await fetchShellHeaderData({
      logFields: globalLogFields,
    })

    const jsonLdData = generateJsonLdsData(postData, '/story/')
    const initialRelatedStories = getInitialRelatedStories(postData)
    const clientStoryPost = serializeStoryPostDataForClient(postData)

    return {
      props: {
        postData: clientStoryPost,
        initialRelatedStories,
        headerData,
        storyLayoutType,
        jsonLdData,
        dataLayer: buildStoryDataLayer(postData),
      },
    }
  } catch (err) {
    logGqlError(
      err,
      `Error occurs while getting data in story page (slug: ${slug})`,
      globalLogFields
    )
    throw new Error(
      `Error occurs while getting data in story page (slug: ${slug})`
    )
  }
}
