import { z } from 'zod'

import client from '@/apollo/apollo-client'
import { fetchSpecials, fetchWeeklys } from '@/apollo/query/magazines'
import { processSettledResult } from '@/utils/response-processor'

import type {
  MagazineCollections,
  SpecialMagazine,
  WeeklyMagazine,
} from './magazine-types'

type NullableImageSet = NonNullable<WeeklyMagazine['coverPhoto']>['resized']

const magazineSlugSchema = z.string().regex(/^(\d+)期-(\w)本$/)

function parseMagazineSlug(slug: unknown) {
  const result = magazineSlugSchema.safeParse(slug)

  if (!result.success) {
    return null
  }

  const match = result.data.match(/^(\d+)期-(\w)本$/)

  if (!match) {
    return null
  }

  return {
    issueNumber: Number(match[1]),
    version: match[2],
  }
}

function getMagazineHrefFromSlug(slug: unknown): string | null {
  const parsedSlug = parseMagazineSlug(slug)

  if (!parsedSlug) {
    return null
  }

  const { issueNumber, version } = parsedSlug

  return `/magazine/Book_${version}/${version}${issueNumber}-Publish`
}

function sortWeeklyMagazines(weeklys: WeeklyMagazine[]): WeeklyMagazine[] {
  return weeklys.slice().sort((a, b) => {
    const parsedA = parseMagazineSlug(a.slug)
    const parsedB = parseMagazineSlug(b.slug)

    if (!parsedA && !parsedB) return 0
    if (!parsedA) return 1
    if (!parsedB) return -1

    if (parsedA.issueNumber !== parsedB.issueNumber) {
      return parsedB.issueNumber - parsedA.issueNumber
    }

    return parsedA.version.localeCompare(parsedB.version)
  })
}

function getValidMagazineSources(weeklys: WeeklyMagazine[]): string[] {
  return weeklys.flatMap((weekly) => {
    const href = getMagazineHrefFromSlug(weekly.slug)
    return href
      ? [
          `https://storage.googleapis.com/mm-magazine/${href.replace('/magazine/', '')}/index.html`,
        ]
      : []
  })
}

function normalizeMagazineImageSet(
  imageSet: NullableImageSet | undefined
): Record<string, string> | undefined {
  const entries = Object.entries(imageSet ?? {}).filter(
    (entry): entry is [string, string] => typeof entry[1] === 'string'
  )

  return entries.length > 0 ? Object.fromEntries(entries) : undefined
}

async function fetchMagazineCollections(): Promise<MagazineCollections> {
  const responses = await Promise.allSettled([
    client.query({ query: fetchSpecials }),
    client.query({ query: fetchWeeklys }),
  ])

  const specials = processSettledResult(
    responses[0],
    (result): SpecialMagazine[] => result?.data.magazines ?? [],
    'Error occurs while getting special magazine in magazine list page'
  )
  const weeklys = processSettledResult(
    responses[1],
    (result): WeeklyMagazine[] => result?.data.magazines ?? [],
    'Error occurs while getting weekly magazine in magazine list page'
  )

  return { specials, weeklys }
}

export {
  fetchMagazineCollections,
  getMagazineHrefFromSlug,
  getValidMagazineSources,
  normalizeMagazineImageSet,
  sortWeeklyMagazines,
}
