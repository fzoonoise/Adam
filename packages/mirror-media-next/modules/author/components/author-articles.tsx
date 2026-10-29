import Image from 'next/legacy/image'

import InfiniteScrollList from '@/components/infinite-scroll-list'
import { ArticleList } from '@/modules/list-article/components/article-list'
import { toArticleListItemData } from '@/modules/list-article/list-article-data'
import type { ArticleListItemData } from '@/modules/list-article/list-article-types'
import LoadingPage from '@/public/images-next/loading_page.gif'
import { fetchPostsByAuthorId } from '@/utils/api/author'
import type { StoryList } from '@/utils/gtm/story-list'

type AuthorArticlesProps = {
  authorId: string
  posts: ArticleListItemData[]
  postsCount: number
  renderPageSize: number
  storyList?: StoryList
}

export default function AuthorArticles({
  authorId,
  posts,
  postsCount,
  renderPageSize,
  storyList,
}: AuthorArticlesProps) {
  const fetchPageSize = renderPageSize * 2

  async function fetchPostsFromPage(page: number) {
    if (!authorId) {
      return
    }

    try {
      const take = fetchPageSize
      const skip = (page - 1) * take
      const { data } = await fetchPostsByAuthorId(authorId, take, skip)
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
      // `InfiniteScrollList` seeds its state from `initialList` on mount only,
      // so moving to another author has to remount it.
      key={authorId}
      initialList={posts}
      renderAmount={renderPageSize}
      fetchCount={Math.ceil(postsCount / fetchPageSize)}
      fetchListInPage={fetchPostsFromPage}
      loader={loader}
    >
      {(renderList) => (
        <ArticleList
          storyList={storyList}
          // `InfiniteScrollList` declares its render list as `Object[]`, a
          // JSDoc type in untyped JavaScript. Correcting it is a separate
          // change.
          renderList={renderList as ArticleListItemData[]}
        />
      )}
    </InfiniteScrollList>
  )
}
