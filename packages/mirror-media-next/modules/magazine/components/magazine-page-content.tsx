import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'

import { Typography } from '@/components/ui/typography'
import { useMembership } from '@/modules/membership/membership-context'
import useMembershipRequired from '@/modules/membership/use-membership-required'

import { fetchMagazineCollections, sortWeeklyMagazines } from '../magazine-data'
import type { SpecialMagazine, WeeklyMagazine } from '../magazine-types'

import JoinPremiumMember from './join-premium-member'
import MagazineFeaturedWeeklys from './magazine-featured-weeklys'
import { MagazineSpecials, MagazineWeeklys } from './magazine-issue-list'
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
  const [weeklys, setWeeklys] = useState<WeeklyMagazine[]>([])
  const { memberInfo } = useMembership()
  const { memberType } = memberInfo

  const canViewPremiumContent =
    memberType.includes('premium') || memberType.includes('staff')

  useEffect(() => {
    if (!canViewPremiumContent) {
      return
    }

    const loadMagazines = async () => {
      try {
        const collections = await fetchMagazineCollections()
        setSpecials(collections.specials)
        setWeeklys(collections.weeklys)
      } catch (error) {
        console.error(error)
      }
    }

    void loadMagazines()
  }, [canViewPremiumContent])

  if (!canViewPremiumContent) {
    return <JoinPremiumMember />
  }

  const sortedMagazines = sortWeeklyMagazines(weeklys)

  return (
    <main className="min-h-[65vh] bg-white xl:-mb-8">
      {weeklys.length > 0 && (
        <>
          <MagazineSection
            title={
              <>
                當期<span className="text-mm-base-500">動態雜誌</span>
              </>
            }
          >
            <MagazineFeaturedWeeklys features={sortedMagazines.slice(0, 2)} />
          </MagazineSection>
          <MagazineSection
            title={
              <>
                近期<span className="text-mm-base-500">動態雜誌</span>
              </>
            }
          >
            <MagazineWeeklys weeklys={sortedMagazines.slice(2)} />
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
