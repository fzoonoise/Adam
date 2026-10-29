import Head from 'next/head'
import { useRouter } from 'next/router'

import { SITE_URL } from '../../../config/index.mjs'
import {
  getActiveOrderCategory,
  getActiveOrderSection,
  hasUtmOrFbParamsInAsPath,
} from '../../../utils'
import { STORY_LIST_BOOTSTRAP_SCRIPT } from '../../../utils/gtm/story-list'
// import Script from 'next/script'
import { toTaipeiISOString } from '../../../utils/index'
import DevGptAd from '../dev-gpt-ad'

/**
 * @typedef {Object} Section
 * @property {string} slug
 * @property {string} name
 */

/**
 * @typedef {import('../../../modules/story/story-types').StoryPost} PostData
 */

/**
 * @typedef {import('../../../apollo/fragments/category').Category} Category
 */

/**
 * @param {PostData} postData
 */
const generateMetaData = (postData) => {
  const {
    slug = '',
    tags = [],
    publishedDate = '',
    updatedAt = '',
    isAdvertised = false,
    sections = [],
    sectionsInInputOrder = [],
    state = 'draft',
    categories = [],
    categoriesInInputOrder = [],
    writers = [],
    writersInInputOrder = [],
    topics = null,
  } = postData

  const robots = 'index, max-image-preview:large'
  const nonAmpUrl = `https://${SITE_URL}/story/${slug}`
  const ampUrl = `https://${SITE_URL}/story/amp/${slug}`
  const shouldCreateAmpHtmlLink = state === 'published' && !isAdvertised
  const tagsNameStr = tags.map((tag) => tag.name).join(', ')
  const sectionsWithOrdered = getActiveOrderSection(
    sections,
    sectionsInInputOrder
  )
  const categoriesWithOrdered = getActiveOrderCategory(
    categories,
    categoriesInInputOrder
  )
  const section = sectionsWithOrdered?.[0]
  const category = categoriesWithOrdered?.[0]
  const topicSlug = topics?.slug ?? ''
  const writersWithOrdered =
    writersInInputOrder && writersInInputOrder.length
      ? writersInInputOrder
      : writers
  const hasWriter = writersWithOrdered && writersWithOrdered.length

  const authorName = hasWriter ? writersWithOrdered?.[0].name : '鏡週刊'
  return {
    slug,
    robots,
    nonAmpUrl,
    ampUrl,
    shouldCreateAmpHtmlLink,
    tagsNameStr,
    section,
    category,
    topicSlug,
    authorName,
    publishedDate,
    updatedAt,
  }
}

/**
 *
 * @param {Object} props
 * @param {PostData} props.postData
 * @returns
 */
export default function StoryHead({ postData }) {
  const router = useRouter()
  const meta = generateMetaData(postData)
  const hasUtmOrFb = hasUtmOrFbParamsInAsPath(router.asPath)
  const robots = hasUtmOrFb ? 'noindex' : meta.robots
  const {
    slug,
    nonAmpUrl,
    ampUrl,
    shouldCreateAmpHtmlLink,
    tagsNameStr,
    section,
    category,
    topicSlug,
    authorName,
    publishedDate,
    updatedAt,
  } = meta

  return (
    <>
      <Head>
        <script
          id="mm-story-list"
          dangerouslySetInnerHTML={{ __html: STORY_LIST_BOOTSTRAP_SCRIPT }}
        />
        <meta name="robots" content={robots} key="robots" />
        {!hasUtmOrFb && (
          <link rel="canonical" href={nonAmpUrl} key="canonical" />
        )}
        {shouldCreateAmpHtmlLink && (
          <link rel="amphtml" href={ampUrl} key="amphtml" />
        )}
        <meta property="dable:item_id" content={slug} key="dable:item_id" />
        <meta property="og:slug" content={slug} key="og:slug" />
        {section?.name && (
          <>
            <meta
              property="section:name"
              content={section.name}
              key="section:name"
            />
            <meta name="section-name" content={section.name} />
          </>
        )}
        {section?.slug && (
          <>
            <meta
              property="section:slug"
              content={section.slug}
              key={'section:slug'}
            />
            <meta name="section-slug" content={section.slug} />
          </>
        )}
        {category?.name && (
          <meta
            property="category:name"
            content={category.name}
            key="category:name"
          />
        )}
        <meta name="author" content={authorName} key="author"></meta>
        {topicSlug !== '' && (
          <meta name="topic-id" content={topicSlug} key="topic-id" />
        )}
        {section?.name && (
          <meta
            property="article:section"
            content={section.name}
            key="article:section"
          />
        )}
        <meta
          property="article:author"
          content={authorName}
          key="article:author"
        ></meta>
        <meta
          name="pubdate"
          property="article:published_time"
          itemProp="datePublished"
          content={toTaipeiISOString(publishedDate)}
          key="article:published_time"
        />
        <meta
          name="lastmod"
          property="article:modified_time"
          itemProp="dateModified"
          content={toTaipeiISOString(updatedAt)}
          key="article:modified_time"
        />
        {tagsNameStr !== '' && (
          <>
            <meta
              property="article:tag"
              content={tagsNameStr}
              key="article:tag"
            />
            <meta name="keywords" content={tagsNameStr} key="keywords" />
            <meta
              name="news_keywords"
              content={tagsNameStr}
              key="news_keywords"
            />
          </>
        )}
      </Head>
      <DevGptAd />
    </>
  )
}
