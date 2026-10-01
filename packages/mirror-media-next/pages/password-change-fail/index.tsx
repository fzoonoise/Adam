import type { MouseEventHandler } from 'react'
import type { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'

import LayoutFull from '../../components/shared/layout-full'
import { ENV } from '../../config/index.mjs'
import GenericFailed from '../../modules/authentication/components/generic-failed'
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

const FROM_TYPE = {
  RECOVER_PASSWORD: '/recover-password',
  UPDATE_PASSWORD: '/update-password',
} as const

type PasswordChangeFailPageProps = {
  headerData: {
    flashNewsData: ShellFlashNews[]
    sectionsData: HeadersData
    topicsData: Topics
  }
}

export default function PasswordChangeFail({
  headerData,
}: PasswordChangeFailPageProps) {
  const router = useRouter()
  const fromData = router.query.from
  const from = Array.isArray(fromData) ? fromData.join('') : fromData

  const onBack: MouseEventHandler<HTMLButtonElement> = () => {
    switch (from) {
      case FROM_TYPE.RECOVER_PASSWORD:
        void router.replace({ pathname: FROM_TYPE.RECOVER_PASSWORD })
        break
      case FROM_TYPE.UPDATE_PASSWORD:
        void router.push({ pathname: FROM_TYPE.UPDATE_PASSWORD })
        break
      default:
        // Preserve the existing no-op for a missing or unrecognized source.
        break
    }
  }

  return (
    <LayoutFull header={{ type: 'default', data: headerData }}>
      <div className="grow bg-white md:bg-mm-neutral-100">
        <GenericFailed primaryText="請回上一頁重試" onBack={onBack} />
      </div>
    </LayoutFull>
  )
}

export const getServerSideProps: GetServerSideProps<
  PasswordChangeFailPageProps
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
    'Error occurs while getting header data in password change failed page',
    globalLogFields
  )

  return {
    props: {
      headerData: { flashNewsData, sectionsData, topicsData },
    },
  }
}
