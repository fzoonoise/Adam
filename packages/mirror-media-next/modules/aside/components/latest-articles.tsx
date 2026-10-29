import { useCallback } from 'react'

import { fetchLatestArticlesInSection } from '../aside-data'

import { AsideArticleList } from './aside-article-list'

type LatestArticlesProps = {
  sectionSlug: string
}

export function LatestArticles({ sectionSlug }: LatestArticlesProps) {
  // Memoised so the list does not rebuild its observer on every render.
  const fetchFunc = useCallback(
    () => fetchLatestArticlesInSection(sectionSlug),
    [sectionSlug]
  )

  return (
    <AsideArticleList
      fetchFunc={fetchFunc}
      storyList="cate_newnews"
      title="最新文章"
    />
  )
}
