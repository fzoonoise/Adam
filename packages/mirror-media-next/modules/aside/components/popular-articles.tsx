import type { PrismAsidePlacementContext } from '@/components/ads/prism/prism-config'

import { fetchPopularArticles } from '../aside-data'

import { AsideArticleList } from './aside-article-list'

type PopularArticlesProps = {
  placement: Exclude<PrismAsidePlacementContext, 'homepage'>
}

export function PopularArticles({ placement }: PopularArticlesProps) {
  return (
    <AsideArticleList
      fetchFunc={fetchPopularArticles}
      storyList="cate_hotnews"
      prismPlacement={placement}
      title="熱門文章"
    />
  )
}
