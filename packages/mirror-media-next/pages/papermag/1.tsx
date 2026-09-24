import type { GetServerSideProps } from 'next'

import Layout from '@/components/shared/layout'
import CheckoutSteps from '@/modules/commerce/checkout-steps'
import PaperMagazineForm from '@/modules/paper-magazine/components/paper-magazine-form'
import { PLAN } from '@/modules/paper-magazine/paper-magazine-data'
import { getLogTraceObject } from '@/utils'
import {
  fetchHeaderDataInDefaultPageLayout,
  type HeadersData,
  type ShellFlashNews,
  type Topics,
} from '@/utils/api'
import { setPageCache } from '@/utils/cache-setting'
import { getSectionAndTopicFromDefaultHeaderData } from '@/utils/data-process'
import { processSettledResult } from '@/utils/response-processor'

type PageProps = Record<string, unknown> & {
  flashNewsData: ShellFlashNews[]
  sectionsData: HeadersData
  topicsData: Topics
}

export default function OneYearSubscription(props: PageProps) {
  return (
    <Layout
      head={{ title: '訂閱一年方案', robotsMetaContent: 'noindex' }}
      header={{
        type: 'default',
        data: {
          flashNewsData: props.flashNewsData,
          sectionsData: props.sectionsData,
          topicsData: props.topicsData,
        },
      }}
    >
      <main className="min-h-[65vh]">
        <CheckoutSteps activeStep={2} />
        <hr className="mb-2 border-mm-neutral-200 md:mb-12" />
        <PaperMagazineForm plan={PLAN.ONE_YEAR} />
      </main>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  req,
  res,
}) => {
  setPageCache(res, { cachePolicy: 'no-store' }, req.url)
  const response = await Promise.allSettled([
    fetchHeaderDataInDefaultPageLayout(),
  ])
  const [sectionsData, topicsData, flashNewsData] = processSettledResult<
    Awaited<ReturnType<typeof fetchHeaderDataInDefaultPageLayout>>,
    ReturnType<typeof getSectionAndTopicFromDefaultHeaderData>
  >(
    response[0],
    getSectionAndTopicFromDefaultHeaderData,
    'Error occurs while getting header data in papermag/1 page',
    { ...getLogTraceObject(req) }
  )
  return { props: { sectionsData, topicsData, flashNewsData } }
}
