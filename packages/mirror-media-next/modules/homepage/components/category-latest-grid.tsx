import NextLink from 'next/link'

import { cn } from '@/components/cn'
import { Link } from '@/components/ui/link'
import { Typography } from '@/components/ui/typography'

import type { HomepageCategory } from '../homepage-types'

import { ArticleImage } from './article-image'
import { homepageCardLinkFocusClass } from './homepage-card-styles'

type CategoryLatestGridProps = {
  categories: HomepageCategory[]
}

function CategoryLatestGrid({ categories }: CategoryLatestGridProps) {
  const visibleCategories = categories.filter(
    (category) => category.articles.length > 0
  )

  if (!visibleCategories.length) return null

  return (
    <section aria-label="分類最新">
      <div className="grid grid-cols-1 gap-mm-2xl md:grid-cols-2 md:gap-x-mm-5xl md:gap-y-mm-3xl">
        {visibleCategories.map((category) => {
          const [featuredArticle, ...otherArticles] = category.articles

          return (
            <article
              className="flex min-h-[340px] flex-col"
              key={category.slug}
            >
              <Typography
                as="h2"
                className="flex h-6 w-fit items-center rounded-mm-xs bg-mm-base-600 px-mm-l text-mm-second-100"
                variant="subtitle"
              >
                {category.name}
              </Typography>

              <div className="mt-mm-xl flex flex-1 flex-col gap-mm-4xl">
                {featuredArticle && (
                  <NextLink
                    className={cn(
                      'group grid grid-cols-[108px_minmax(0,1fr)] gap-mm-3xl',
                      homepageCardLinkFocusClass
                    )}
                    data-story-list="index_cate_news"
                    href={featuredArticle.href}
                  >
                    <span className="relative block h-[77px] w-[108px] overflow-hidden bg-mm-neutral-100">
                      <ArticleImage
                        alt=""
                        sizes="108px"
                        src={featuredArticle.imageUrl}
                      />
                    </span>
                    <Typography
                      as="h3"
                      className="line-clamp-2 text-mm-neutral-700 group-hover:underline"
                      variant="h5"
                    >
                      {featuredArticle.title}
                    </Typography>
                  </NextLink>
                )}

                {otherArticles.slice(0, 2).map((article) => (
                  <NextLink
                    className={cn('group block', homepageCardLinkFocusClass)}
                    data-story-list="index_cate_news"
                    href={article.href}
                    key={article.key}
                  >
                    <Typography
                      as="h3"
                      className="line-clamp-2 text-mm-neutral-700 group-hover:underline"
                      variant="h5"
                    >
                      {article.title}
                    </Typography>
                  </NextLink>
                ))}
              </div>

              <div className="mt-mm-4xl flex items-center justify-between">
                <span className="h-px w-1/2 bg-mm-neutral-500" />
                <Link
                  className="rounded-mm-xs text-mm-h5 text-mm-neutral-800"
                  href={category.href}
                  variant="plain"
                >
                  看更多
                </Link>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export { CategoryLatestGrid }
