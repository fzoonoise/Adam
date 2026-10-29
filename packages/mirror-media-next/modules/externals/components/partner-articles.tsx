import Image from 'next/legacy/image'

import InfiniteScrollList from '@/components/infinite-scroll-list'
import { ArticleList } from '@/modules/list-article/components/article-list'
import type { ArticleListItemData } from '@/modules/list-article/list-article-types'
import LoadingPage from '@/public/images-next/loading_page.gif'
import { fetchExternalsByPartnerSlug } from '@/utils/api/externals'
import type { StoryList } from '@/utils/gtm/story-list'

import { toExternalListItemData } from '../externals-data'

type PartnerArticlesProps = {
  externals: ArticleListItemData[]
  externalsCount: number
  partnerSlug: string
  renderPageSize: number
  section: { name: string; slug: string }
  storyList?: StoryList
}

export default function PartnerArticles({
  externals,
  externalsCount,
  partnerSlug,
  renderPageSize,
  section,
  storyList,
}: PartnerArticlesProps) {
  const fetchPageSize = renderPageSize * 2

  async function fetchExternalsFromPage(page: number) {
    if (!partnerSlug) {
      return
    }

    try {
      const { data } = await fetchExternalsByPartnerSlug(
        page,
        renderPageSize,
        partnerSlug
      )
      return (data.externals ?? []).map(toExternalListItemData)
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
      key={partnerSlug}
      initialList={externals}
      renderAmount={renderPageSize}
      fetchCount={Math.ceil(externalsCount / fetchPageSize)}
      fetchListInPage={fetchExternalsFromPage}
      loader={loader}
    >
      {(renderList) => (
        <ArticleList
          storyList={storyList}
          // `InfiniteScrollList` declares its render list as `Object[]`, a
          // JSDoc type in untyped JavaScript. Correcting it is a separate
          // change.
          renderList={renderList as ArticleListItemData[]}
          section={section}
        />
      )}
    </InfiniteScrollList>
  )
}
