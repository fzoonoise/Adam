import type { GetServerSideProps } from 'next'

import Layout from '@/components/shared/layout'
import { Typography } from '@/components/ui/typography'
import { ANNOUNCEMENT_SCOPE } from '@/constants/announcement'
import CheckoutSteps from '@/modules/commerce/checkout-steps'
import PaperMagazineNotice from '@/modules/paper-magazine/components/paper-magazine-notice'
import PlanSelection from '@/modules/paper-magazine/components/plan-selection'
import type { Announcement } from '@/modules/paper-magazine/paper-magazine-types'
import { getLogTraceObject } from '@/utils'
import {
  fetchAnnouncementsByScope,
  fetchHeaderDataInDefaultPageLayout,
  type HeadersData,
  type ShellFlashNews,
  type Topics,
} from '@/utils/api'
import { setPageCache } from '@/utils/cache-setting'
import { getSectionAndTopicFromDefaultHeaderData } from '@/utils/data-process'
import { processSettledResult } from '@/utils/response-processor'

type PaperMagazinePageProps = Record<string, unknown> & {
  announcements: Announcement[]
  flashNewsData: ShellFlashNews[]
  sectionsData: HeadersData
  topicsData: Topics
}

export default function PaperMagazine({
  announcements = [],
  flashNewsData = [],
  sectionsData = [],
  topicsData = [],
}: PaperMagazinePageProps) {
  return (
    <Layout
      head={{ title: '訂閱紙本雜誌' }}
      header={{
        type: 'default',
        data: { flashNewsData, sectionsData, topicsData },
      }}
    >
      <main className="min-h-[65vh]">
        <CheckoutSteps activeStep={1} />
        <div className="bg-mm-neutral-100">
          {announcements.length > 0 && (
            <section className="py-3 md:-mb-12 md:py-6">
              {announcements.map(({ id, title, description }) => (
                <div
                  className="mx-auto grid w-9/10 gap-2 rounded-mm-m bg-mm-error-100 p-4 xl:w-240"
                  key={id}
                >
                  <Typography
                    className="font-medium text-mm-error-500"
                    variant="body-l"
                  >
                    {title}
                  </Typography>
                  <Typography
                    className="text-justify break-all whitespace-pre-line text-mm-neutral-600"
                    variant="body2"
                  >
                    {description}
                  </Typography>
                </div>
              ))}
            </section>
          )}
          <PlanSelection />
        </div>
        <PaperMagazineNotice />
      </main>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps<
  PaperMagazinePageProps
> = async ({ req, res }) => {
  setPageCache(res, { cachePolicy: 'no-store' }, req.url)
  const globalLogFields = { ...getLogTraceObject(req) }
  const [headerResponse, announcementResponse] = await Promise.allSettled([
    fetchHeaderDataInDefaultPageLayout(),
    fetchAnnouncementsByScope([ANNOUNCEMENT_SCOPE.PAPER_MAG]),
  ])

  const [sectionsData, topicsData, flashNewsData] = processSettledResult<
    Awaited<ReturnType<typeof fetchHeaderDataInDefaultPageLayout>>,
    ReturnType<typeof getSectionAndTopicFromDefaultHeaderData>
  >(
    headerResponse,
    getSectionAndTopicFromDefaultHeaderData,
    'Error occurs while getting header data in papermag page',
    globalLogFields
  )
  const announcements = processSettledResult<
    Awaited<ReturnType<typeof fetchAnnouncementsByScope>>,
    Announcement[]
  >(
    announcementResponse,
    (result) =>
      (result?.data?.announcements ?? []).filter(
        (announcement) => announcement.isActive
      ),
    'Error occurs while getting announcements in papermag page'
  )

  return {
    props: { sectionsData, topicsData, flashNewsData, announcements },
  }
}
