import Image from '@readr-media/react-image'

import { Link } from '@/components/ui/link'
import { Typography } from '@/components/ui/typography'
import { DEFAULT_OG_IMAGE_URL } from '@/constants'
import ReadingIcon from '@/public/images-next/magazine-online.svg'

import {
  getMagazineHrefFromSlug,
  normalizeMagazineImageSet,
} from '../magazine-data'
import type { WeeklyMagazine } from '../magazine-types'

type MagazineFeaturedWeekliesProps = {
  features: WeeklyMagazine[]
}

export default function MagazineFeaturedWeeklies({
  features,
}: MagazineFeaturedWeekliesProps) {
  return (
    <ul className="mx-auto mt-8 grid w-70 grid-cols-1 justify-items-center gap-5 md:w-168 xl:mt-12 xl:w-276 xl:grid-cols-2">
      {features.map((magazine) => (
        <li key={magazine.id} className="w-full">
          <Link
            className="group block hover:no-underline"
            href={getMagazineHrefFromSlug(magazine.slug) ?? '/magazine'}
            rel="noopener"
            target="_blank"
            variant="plain"
          >
            <article className="flex w-full flex-col items-center justify-center rounded-mm-xs border border-mm-neutral-400 p-6 md:mx-auto md:w-136 md:flex-row md:items-start">
              <div className="h-53 w-40 shrink-0 overflow-hidden bg-mm-neutral-100 md:mr-8 xl:h-66 xl:w-50 [&_img]:w-full">
                <Image
                  images={normalizeMagazineImageSet(
                    magazine.coverPhoto?.resized
                  )}
                  loadingImage="/images-next/loading.gif"
                  defaultImage={DEFAULT_OG_IMAGE_URL}
                  alt={magazine.title ?? ''}
                  rwd={{
                    tablet: '160px',
                    desktop: '200px',
                    default: '100%',
                  }}
                />
              </div>
              <div className="flex h-53 flex-col md:w-66 xl:h-66">
                <Typography className="p-3 text-mm-second-500" variant="body-m">
                  {magazine.slug}
                </Typography>
                <Typography
                  className="text-xl leading-7 font-normal text-mm-neutral-600 xl:leading-8"
                  variant="h4"
                >
                  {magazine.title}
                </Typography>
                <span className="mt-auto flex h-12 w-full items-center justify-center gap-2 rounded-mm-xs bg-mm-base-500 font-mm-sans text-mm-body-l text-white group-hover:bg-mm-second-700">
                  <ReadingIcon aria-hidden="true" />
                  線上閱讀
                </span>
              </div>
            </article>
          </Link>
        </li>
      ))}
    </ul>
  )
}
