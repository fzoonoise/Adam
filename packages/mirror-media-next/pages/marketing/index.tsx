// TODO: add handle-forbid-to-marketing middleware

import type { GetServerSideProps } from 'next'

import { cn } from '@/components/cn'
import Layout from '@/components/shared/layout'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Link } from '@/components/ui/link'
import { Typography } from '@/components/ui/typography'
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

type MarketingPageProps = Record<string, unknown> & {
  flashNewsData: ShellFlashNews[]
  sectionsData: HeadersData
  topicsData: Topics
}

export default function Marketing({
  flashNewsData = [],
  sectionsData = [],
  topicsData = [],
}: MarketingPageProps) {
  return (
    <Layout
      head={{ title: 'VIP或團體訂購' }}
      header={{
        type: 'default',
        data: { flashNewsData, sectionsData, topicsData },
      }}
    >
      <main className="min-h-[70vh] px-5 py-10 md:bg-mm-neutral-100 md:p-12 xl:-mb-8">
        <Card className="m-auto border-0 p-0 md:w-117 md:border md:border-mm-neutral-200 md:p-10 md:shadow-lg">
          <Typography as="h1" className="mb-3 font-medium" variant="h3">
            此頁面為個人會員訂閱頁面
          </Typography>
          <Typography className="mb-6 text-mm-neutral-500" variant="body-l">
            由於您為鏡週刊的 VIP，VIP
            期間不須付款即享會員專區文章暢讀。若您有意願付費支持，請於期間後再付款。
          </Typography>
          <Link
            className={cn(
              buttonVariants({ size: 'lg' }),
              'w-full rounded-mm-l no-underline shadow-md hover:no-underline'
            )}
            href="/premiumsection/member"
            variant="plain"
          >
            回會員專區
          </Link>
        </Card>
      </main>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps<
  MarketingPageProps
> = async ({ req, res }) => {
  setPageCache(res, { cachePolicy: 'no-store' }, req.url)
  const responses = await Promise.allSettled([
    fetchHeaderDataInDefaultPageLayout(),
  ])
  const [sectionsData, topicsData, flashNewsData] = processSettledResult<
    Awaited<ReturnType<typeof fetchHeaderDataInDefaultPageLayout>>,
    ReturnType<typeof getSectionAndTopicFromDefaultHeaderData>
  >(
    responses[0],
    getSectionAndTopicFromDefaultHeaderData,
    'Error occurs while getting header data in marketing page',
    { ...getLogTraceObject(req) }
  )

  return {
    props: { sectionsData, topicsData, flashNewsData },
  }
}
