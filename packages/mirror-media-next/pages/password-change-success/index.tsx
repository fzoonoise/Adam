import type { GetServerSideProps } from 'next'

import LayoutFull from '../../components/shared/layout-full'
import { ENV } from '../../config/index.mjs'
import PasswordChangeSuccessContent from '../../modules/authentication/components/password-change-success'
import { getLogTraceObject } from '../../utils'
import {
  fetchHeaderDataInDefaultPageLayout,
  type HeadersData,
  type ShellFlashNews,
  type Topics,
} from '../../utils/api'
import { setPageCache } from '../../utils/cache-setting'
import { getSectionAndTopicFromDefaultHeaderData } from '../../utils/data-process'
import { processSettledResult } from '../../utils/response-processor'

type PasswordChangeSuccessPageProps = {
  headerData: {
    flashNewsData: ShellFlashNews[]
    sectionsData: HeadersData
    topicsData: Topics
  }
}

export default function PasswordChangeSuccess({
  headerData,
}: PasswordChangeSuccessPageProps) {
  return (
    <LayoutFull header={{ type: 'default', data: headerData }}>
      <div className="grow bg-white md:bg-mm-neutral-100">
        <main className="flex flex-col items-center">
          <PasswordChangeSuccessContent />
        </main>
      </div>
    </LayoutFull>
  )
}

export const getServerSideProps: GetServerSideProps<
  PasswordChangeSuccessPageProps
> = async ({ req, res }) => {
  if (ENV === 'prod') {
    setPageCache(res, { cachePolicy: 'max-age', cacheTime: 900 }, req.url)
  } else {
    setPageCache(res, { cachePolicy: 'no-store' }, req.url)
  }

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
    'Error occurs while getting header data in password change success page',
    globalLogFields
  )

  return {
    props: {
      headerData: { flashNewsData, sectionsData, topicsData },
    },
  }
}
