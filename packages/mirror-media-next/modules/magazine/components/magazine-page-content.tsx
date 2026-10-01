import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'

import { Typography } from '@/components/ui/typography'
import { useMembership } from '@/modules/membership/membership-context'
import useMembershipRequired from '@/modules/membership/use-membership-required'

import { fetchMagazineCollections, sortWeeklyMagazines } from '../magazine-data'
import type { SpecialMagazine, WeeklyMagazine } from '../magazine-types'

import JoinPremiumMember from './join-premium-member'
import MagazineFeaturedWeeklies from './magazine-featured-weeklies'
import { MagazineSpecials, MagazineWeeklies } from './magazine-issue-list'
import MagazinePlatforms from './magazine-platforms'

function MagazineSection({
  children,
  title,
}: {
  children: ReactNode
  title: ReactNode
}) {
  return (
    <section className="px-5 py-12 even:bg-mm-neutral-100 md:px-0 xl:py-15">
      <Typography
        as="h2"
        className="text-center font-medium tracking-wider text-mm-neutral-600 xl:text-mm-h1"
        variant="h2"
      >
        {title}
      </Typography>
      {children}
    </section>
  )
}

export default function MagazinePageContent() {
  useMembershipRequired()
  const [specials, setSpecials] = useState<SpecialMagazine[]>([])
  const [weeklies, setWeeklies] = useState<WeeklyMagazine[]>([])
  const { memberInfo } = useMembership()
  const { memberType } = memberInfo

  const canViewPremiumContent =
    memberType.includes('premium') || memberType.includes('staff')

  // Fetch magazine data only for premium members or staff.
  useEffect(() => {
    if (!canViewPremiumContent) {
      return
    }

    const loadMagazines = async () => {
      try {
        const collections = await fetchMagazineCollections()
        setSpecials(collections.specials)
        setWeeklies(collections.weeklies)
      } catch (error) {
        console.error(error)
      }
    }

    void loadMagazines()
  }, [canViewPremiumContent])

  if (!canViewPremiumContent) {
    return <JoinPremiumMember />
  }

  const sortedMagazines = sortWeeklyMagazines(weeklies)

  return (
    <main className="min-h-[65vh] bg-white xl:-mb-8">
      {weeklies.length > 0 && (
        <>
          <MagazineSection
            title={
              <>
                當期<span className="text-mm-base-500">動態雜誌</span>
              </>
            }
          >
            <MagazineFeaturedWeeklies features={sortedMagazines.slice(0, 2)} />
          </MagazineSection>
          <MagazineSection
            title={
              <>
                近期<span className="text-mm-base-500">動態雜誌</span>
              </>
            }
          >
            <MagazineWeeklies weeklies={sortedMagazines.slice(2)} />
          </MagazineSection>
        </>
      )}

      {specials.length > 0 && (
        <MagazineSection title="特刊">
          <MagazineSpecials specials={specials} />
        </MagazineSection>
      )}

      <MagazineSection title="購買線上雜誌">
        <MagazinePlatforms />
      </MagazineSection>
    </main>
  )
}
