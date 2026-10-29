import type { GetServerSideProps } from 'next'
import dayjs from 'dayjs'

import { PageShell } from '@/components/shell/page-shell'
import { ENV, WEEKLY_END_TS, WEEKLY_START_TS } from '@/config/index.mjs'
import { Homepage } from '@/modules/homepage/components/homepage'
import { fetchHomepageData } from '@/modules/homepage/homepage-data'
import type { HomepagePageProps } from '@/modules/homepage/homepage-types'
import { getLogTraceObject } from '@/utils'
import { fetchShellHeaderData, fetchShellSectionPosts } from '@/utils/api'
import { setPageCache } from '@/utils/cache-setting'

export default function HomePage({
  headerData,
  homepageData,
  isElectionPeriod,
}: HomepagePageProps) {
  return (
    <>
      <PageShell headerData={headerData} pauseCarouselTickerOnIdle>
        <Homepage data={homepageData} isElectionPeriod={isElectionPeriod} />
      </PageShell>
    </>
  )
}

export const getServerSideProps = (async ({ req, res }) => {
  if (ENV === 'prod') {
    setPageCache(
      res,
      {
        cachePolicy: 'max-age',
        cacheTime: 180,
        sharedCacheTime: 180,
        staleWhileRevalidate: 3600,
      },
      req.url
    )
  } else {
    setPageCache(res, { cachePolicy: 'no-store' }, req.url)
  }

  const globalLogFields: Record<string, unknown> = {
    ...getLogTraceObject(req),
  }
  const sectionPostsPromise = fetchShellSectionPosts({
    logFields: globalLogFields,
  }).catch(() => ({}))
  const [headerData, homepageData] = await Promise.all([
    fetchShellHeaderData({
      logFields: globalLogFields,
      sectionPostsPromise,
    }),
    fetchHomepageData(globalLogFields, sectionPostsPromise),
  ])
  // Runtime env is server-only. Comparing here also means SSR and hydration
  // share one result instead of each reading its own clock.
  const now = dayjs()
  const start = dayjs(WEEKLY_START_TS)
  const end = dayjs(WEEKLY_END_TS)

  return {
    props: {
      headerData,
      homepageData,
      isElectionPeriod:
        !!WEEKLY_START_TS &&
        !!WEEKLY_END_TS &&
        start.isValid() &&
        end.isValid() &&
        !now.isBefore(start) &&
        !now.isAfter(end),
    },
  }
}) satisfies GetServerSideProps<HomepagePageProps>
