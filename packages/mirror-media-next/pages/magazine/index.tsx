import type { GetServerSideProps } from 'next'

import Layout from '@/components/shared/layout'
import MagazinePageContent from '@/modules/magazine/components/magazine-page-content'
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
import redirectToLoginWhileUnauthed from '@/utils/server-side-only/redirect-to-login-while-unauthed'

type MagazinePageProps = Record<string, unknown> & {
  flashNewsData: ShellFlashNews[]
  sectionsData: HeadersData
  topicsData: Topics
}

export default function Magazine({
  flashNewsData = [],
  sectionsData = [],
  topicsData = [],
}: MagazinePageProps) {
  return (
    <Layout
      head={{ title: '動態雜誌' }}
      header={{
        type: 'default',
        data: { flashNewsData, sectionsData, topicsData },
      }}
    >
      <MagazinePageContent />
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps<MagazinePageProps> =
  redirectToLoginWhileUnauthed()<MagazinePageProps>(async ({ req, res }) => {
    setPageCache(res, { cachePolicy: 'no-store' }, req.url)

    const globalLogFields: Record<string, unknown> = {
      ...getLogTraceObject(req),
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
      'Error occurs while getting V4 header data in magazine list page',
      globalLogFields
    )

    return {
      props: {
        sectionsData,
        topicsData,
        flashNewsData,
      },
    }
  })
