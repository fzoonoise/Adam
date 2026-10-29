import Image from 'next/legacy/image'

import InfiniteScrollList from '@/components/infinite-scroll-list'
import { ArticleList } from '@/modules/list-article/components/article-list'
import { toArticleListItemData } from '@/modules/list-article/list-article-data'
import type { ArticleListItemData } from '@/modules/list-article/list-article-types'
import LoadingPage from '@/public/images-next/loading_page.gif'
import {
  fetchPostsByCategorySlug,
  fetchPremiumPostsByCategorySlug,
} from '@/utils/api/category'
import type { StoryList } from '@/utils/gtm/story-list'

import { fetchNewsCategoryPostsJSON } from '../category-data'
import type { CategorySummary } from '../category-types'

type CategoryArticlesProps = {
  category: CategorySummary
  isNewsCategory: boolean
  isPremium: boolean
  posts: ArticleListItemData[]
  postsCount: number
  renderPageSize: number
  storyList?: StoryList
}

export default function CategoryArticles({
  category,
  isNewsCategory,
  isPremium,
  posts,
  postsCount,
  renderPageSize,
  storyList,
}: CategoryArticlesProps) {
  const fetchPageSize = renderPageSize * 2

  async function fetchPostsFromPage(page: number) {
    if (!category?.slug) {
      return
    }

    const take = fetchPageSize
    const skip = (page - 1) * take

    try {
      if (isPremium) {
        const { data } = await fetchPremiumPostsByCategorySlug(
          category.slug,
          take,
          skip
        )
        return (data.posts ?? []).map(toArticleListItemData)
      }

      if (isNewsCategory) {
        const { items } = await fetchNewsCategoryPostsJSON(page, take)
        return items
      }

      const { data } = await fetchPostsByCategorySlug(category.slug, take, skip)
      return (data.posts ?? []).map(toArticleListItemData)
    } catch (error) {
      // [to-do]: use beacon api to log error on gcs
      console.error(error)
      return
    }
  }

  const loader = (
    <div
      key={0}
      className="mx-auto mt-mm-2xl pb-mm-2xl text-center legacy-xl:mt-16 legacy-xl:pb-16"
    >
      <Image src={LoadingPage} alt="loading page" />
    </div>
  )

  return (
    <InfiniteScrollList
      initialList={posts}
      renderAmount={renderPageSize}
      fetchCount={Math.ceil(postsCount / fetchPageSize)}
      fetchListInPage={fetchPostsFromPage}
      loader={loader}
      key={category.slug}
    >
      {(renderList) => (
        <ArticleList
          storyList={storyList}
          // `InfiniteScrollList` declares its render list as `Object[]`, a
          // JSDoc type in untyped JavaScript. Correcting it is a separate
          // change.
          renderList={renderList as ArticleListItemData[]}
          section={category.sections[0]}
        />
      )}
    </InfiniteScrollList>
  )
}
