/**
 * Custom Firebase Email handler
 * @see https://firebase.google.com/docs/auth/custom-email-handler
 */

import type { GetServerSideProps } from 'next'

import LayoutFull from '../../components/shared/layout-full'
import BodyEmailVerification from '../../modules/authentication/components/email-verification'
import BodyPasswordReset from '../../modules/authentication/components/password-reset'
import { getLogTraceObject, getSearchParamFromApiKeyUrl } from '../../utils'
import {
  fetchHeaderDataInDefaultPageLayout,
  type HeadersData,
  type ShellFlashNews,
  type Topics,
} from '../../utils/api'
import { setPageCache } from '../../utils/cache-setting'
import { getSectionAndTopicFromDefaultHeaderData } from '../../utils/data-process'
import { processSettledResult } from '../../utils/response-processor'

const RESET_PASSWORD = 'resetPassword'
const VERIFY_EMAIL = 'verifyEmail'

type EmailHandlerMode = typeof RESET_PASSWORD | typeof VERIFY_EMAIL

type EmailHandlerPageProps = {
  mode: EmailHandlerMode
  headerData: {
    flashNewsData: ShellFlashNews[]
    sectionsData: HeadersData
    topicsData: Topics
  }
}

export default function EmailHandler({
  mode,
  headerData,
}: EmailHandlerPageProps) {
  const body =
    mode === RESET_PASSWORD ? <BodyPasswordReset /> : <BodyEmailVerification />

  return (
    <LayoutFull header={{ type: 'default', data: headerData }}>
      <div className="grow bg-white md:bg-mm-neutral-100">{body}</div>
    </LayoutFull>
  )
}

export const getServerSideProps: GetServerSideProps<
  EmailHandlerPageProps
> = async ({ req, res, query }) => {
  setPageCache(res, { cachePolicy: 'no-store' }, req.url)

  const globalLogFields: Record<string, unknown> = {
    ...getLogTraceObject(req),
  }
  const mode = getSearchParamFromApiKeyUrl(query, 'mode')

  if (mode !== RESET_PASSWORD && mode !== VERIFY_EMAIL) {
    return { notFound: true }
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
    'Error occurs while getting header data in email-handler',
    globalLogFields
  )

  return {
    props: {
      mode,
      headerData: { flashNewsData, sectionsData, topicsData },
    },
  }
}
