import { z } from 'zod'

import client from '@/apollo/apollo-client'
import { fetchSpecials, fetchWeeklies } from '@/apollo/query/magazines'
import { processSettledResult } from '@/utils/response-processor'

import type {
  MagazineCollections,
  SpecialMagazine,
  WeeklyMagazine,
} from './magazine-types'

type NullableImageSet = NonNullable<WeeklyMagazine['coverPhoto']>['resized']

const MAGAZINE_SLUG_PATTERN = /(\d+)期-(\w)本/
const magazineSlugSchema = z.string().regex(MAGAZINE_SLUG_PATTERN)

function parseMagazineSlug(slug: unknown) {
  const result = magazineSlugSchema.safeParse(slug)

  if (!result.success) {
    return null
  }

  const match = result.data.match(MAGAZINE_SLUG_PATTERN)

  if (!match) {
    return null
  }

  return {
    issueNumber: Number(match[1]),
    version: match[2],
  }
}

function getMagazineHrefFromSlug(slug: unknown): string | null {
  if (typeof slug !== 'string') {
    return null
  }

  const parsedSlug = parseMagazineSlug(slug)
  // TODO: Support C and other editions or slug formats once content publishing
  // or the backend provides reader resources and explicit URL mappings.
  // Preserve the restriction on original PDF downloads; do not fall back to B.
  if (
    !parsedSlug ||
    (parsedSlug.version !== 'A' && parsedSlug.version !== 'B')
  ) {
    return null
  }

  // Preserve the original issue text, including leading zeros.
  const issueNumber = slug.match(/\d+/)?.[0]
  if (!issueNumber) {
    return null
  }
  const version = parsedSlug.version

  return `/magazine/Book_${version}/${version}${issueNumber}-Publish`
}

function sortWeeklyMagazines(weeklies: WeeklyMagazine[]): WeeklyMagazine[] {
  return weeklies.slice().sort((a, b) => {
    const parsedA = parseMagazineSlug(a.slug)
    const parsedB = parseMagazineSlug(b.slug)

    if (!parsedA && !parsedB) return 0
    if (!parsedA) return 1
    if (!parsedB) return -1

    if (parsedA.issueNumber !== parsedB.issueNumber) {
      return parsedB.issueNumber - parsedA.issueNumber
    }

    // If issue number is the same, sort by version in ascending order
    // If version is also the same, maintain the original order
    return parsedA.version.localeCompare(parsedB.version)
  })
}

function getValidMagazineSources(weeklies: WeeklyMagazine[]): string[] {
  return weeklies.flatMap((weekly) => {
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
    client.query({ query: fetchWeeklies }),
  ])

  const specials = processSettledResult(
    responses[0],
    (result): SpecialMagazine[] => result?.data.magazines ?? [],
    'Error occurs while getting special magazine in magazine list page'
  )
  const weeklies = processSettledResult(
    responses[1],
    (result): WeeklyMagazine[] => result?.data.magazines ?? [],
    'Error occurs while getting weekly magazine in magazine list page'
  )

  return { specials, weeklies }
}

export {
  fetchMagazineCollections,
  getMagazineHrefFromSlug,
  getValidMagazineSources,
  normalizeMagazineImageSet,
  sortWeeklyMagazines,
}
