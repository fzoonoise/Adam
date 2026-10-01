// TODO: add handle-go-to-marketing middleware

import type { GetServerSideProps } from 'next'

import Layout from '@/components/shared/layout'
import { ACCESS_SUBSCRIBE_FEATURE_TOGGLE } from '@/config/index.mjs'
import SubscriptionPageContent from '@/modules/subscription/components/subscription-page-content'
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

type SubscribePageProps = Record<string, unknown> & {
  flashNewsData: ShellFlashNews[]
  sectionsData: HeadersData
  topicsData: Topics
}

export default function Subscribe({
  flashNewsData = [],
  sectionsData = [],
  topicsData = [],
}: SubscribePageProps) {
  return (
    <Layout
      head={{ title: '會員方案選擇' }}
      header={{
        type: 'default',
        data: { flashNewsData, sectionsData, topicsData },
      }}
    >
      <SubscriptionPageContent />
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps<
  SubscribePageProps
> = async ({ req, res }) => {
  setPageCache(res, { cachePolicy: 'no-store' }, req.url)

  if (ACCESS_SUBSCRIBE_FEATURE_TOGGLE !== 'on') {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  const responses = await Promise.allSettled([
    fetchHeaderDataInDefaultPageLayout(),
  ])
  const [sectionsData, topicsData, flashNewsData] = processSettledResult<
    Awaited<ReturnType<typeof fetchHeaderDataInDefaultPageLayout>>,
    ReturnType<typeof getSectionAndTopicFromDefaultHeaderData>
  >(
    responses[0],
    getSectionAndTopicFromDefaultHeaderData,
    'Error occurs while getting header data in subscribe page',
    { ...getLogTraceObject(req) }
  )

  return {
    props: { sectionsData, topicsData, flashNewsData },
  }
}
