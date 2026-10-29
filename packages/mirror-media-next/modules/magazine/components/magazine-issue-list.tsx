import type { ReactNode } from 'react'
import Image from '@readr-media/react-image'

import { Link } from '@/components/ui/link'
import { Typography } from '@/components/ui/typography'
import { DEFAULT_OG_IMAGE_URL } from '@/constants'
import DownloadIcon from '@/public/images-next/magazine-download-icon.svg'
import ReadingIcon from '@/public/images-next/magazine-online.svg'
import { transformTimeDataIntoSlashFormat } from '@/utils'

import {
  getMagazineHrefFromSlug,
  normalizeMagazineImageSet,
} from '../magazine-data'
import type { SpecialMagazine, WeeklyMagazine } from '../magazine-types'

type MagazineLinkProps = {
  children: ReactNode
  href: string | null
}

function MagazineLink({ children, href }: MagazineLinkProps) {
  return (
    <Link
      className="group block hover:no-underline"
      href={href || '/magazine'}
      rel={href ? 'noopener' : undefined}
      target={href ? '_blank' : undefined}
      variant="plain"
    >
      {children}
    </Link>
  )
}

function CoverOverlay({ children }: { children: ReactNode }) {
  return (
    <span className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-mm-base-500/90 text-mm-body2 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
      {children}
    </span>
  )
}

function IssueCard({
  magazine,
  type,
}: {
  magazine: SpecialMagazine | WeeklyMagazine
  type: 'special' | 'weekly'
}) {
  const isWeekly = type === 'weekly'
  const href = isWeekly
    ? getMagazineHrefFromSlug(magazine.slug)
    : magazine.urlOriginal

  return (
    <li className="relative w-33 md:w-36">
      <MagazineLink href={href}>
        <div className="relative h-45 w-33 overflow-hidden bg-mm-neutral-100 md:h-49 md:w-36 [&_img]:w-full">
          <Image
            images={normalizeMagazineImageSet(magazine.coverPhoto?.resized)}
            imagesWebP={normalizeMagazineImageSet(
              magazine.coverPhoto?.resizedWebp
            )}
            loadingImage="/images-next/loading.gif"
            defaultImage={DEFAULT_OG_IMAGE_URL}
            alt={magazine.title ?? ''}
            rwd={{ mobile: '132px', tablet: '144px', default: '100%' }}
          />
          <CoverOverlay>
            {isWeekly ? (
              <ReadingIcon aria-hidden="true" />
            ) : (
              <DownloadIcon aria-hidden="true" />
            )}
            <span>{isWeekly ? '線上閱讀' : '立即下載'}</span>
          </CoverOverlay>
        </div>
        <Typography
          className="pt-3 pb-2 text-center text-mm-second-500"
          variant="body-m"
        >
          {magazine.publishedDate
            ? transformTimeDataIntoSlashFormat(magazine.publishedDate, false)
            : ''}
        </Typography>
        <Typography
          className="text-center font-normal text-mm-neutral-600"
          variant="body-l"
        >
          {isWeekly ? magazine.slug : magazine.title}
        </Typography>
        {isWeekly && (
          <span className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-mm-xs border border-mm-base-500 bg-white font-mm-sans text-mm-body-m text-mm-base-500 group-hover:bg-mm-neutral-100">
            <ReadingIcon aria-hidden="true" fill="currentColor" />
            線上閱讀
          </span>
        )}
      </MagazineLink>
    </li>
  )
}

function MagazineWeeklies({ weeklies }: { weeklies: WeeklyMagazine[] }) {
  return (
    <ul className="mx-auto mt-8 grid w-70 grid-cols-2 justify-items-center gap-x-4 gap-y-12 md:w-168 md:grid-cols-4 md:gap-x-8 xl:mt-12 xl:w-276 xl:grid-cols-6 xl:gap-x-12 xl:gap-y-15">
      {weeklies.map((magazine) => (
        <IssueCard key={magazine.id} magazine={magazine} type="weekly" />
      ))}
    </ul>
  )
}

function MagazineSpecials({ specials }: { specials: SpecialMagazine[] }) {
  return (
    <ul className="mx-auto mt-8 grid w-70 grid-cols-2 justify-items-center gap-x-4 gap-y-12 md:w-124 md:grid-cols-3 md:gap-x-8 lg:w-168 lg:grid-cols-4 xl:mt-12 xl:w-276 xl:grid-cols-6 xl:gap-x-12 xl:gap-y-15">
      {specials.map((magazine) => (
        <IssueCard key={magazine.id} magazine={magazine} type="special" />
      ))}
    </ul>
  )
}

export { MagazineSpecials, MagazineWeeklies }
