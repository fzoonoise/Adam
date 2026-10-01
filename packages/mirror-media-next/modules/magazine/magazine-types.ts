import type {
  FetchSpecialsQuery,
  FetchWeekliesQuery,
} from '@/apollo/__generated__/content/graphql'

type SpecialMagazine = NonNullable<FetchSpecialsQuery['magazines']>[number]
type WeeklyMagazine = NonNullable<FetchWeekliesQuery['magazines']>[number]

type MagazineCollections = {
  specials: SpecialMagazine[]
  weeklies: WeeklyMagazine[]
}

export type { MagazineCollections, SpecialMagazine, WeeklyMagazine }
