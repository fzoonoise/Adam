import type {
  FetchSpecialsQuery,
  FetchWeeklysQuery,
} from '@/apollo/__generated__/content/graphql'

type SpecialMagazine = NonNullable<FetchSpecialsQuery['magazines']>[number]
type WeeklyMagazine = NonNullable<FetchWeeklysQuery['magazines']>[number]

type MagazineCollections = {
  specials: SpecialMagazine[]
  weeklys: WeeklyMagazine[]
}

export type { MagazineCollections, SpecialMagazine, WeeklyMagazine }
