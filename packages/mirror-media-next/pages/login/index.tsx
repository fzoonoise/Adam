import type { GetServerSideProps } from 'next'

import LayoutFull from '../../components/shared/layout-full'
import { isInAppBrowser } from '../../modules/authentication/authentication-utils'
import LoginPageContent from '../../modules/authentication/components/login-page-content'
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
import redirectToDestinationWhileAuthed from '../../utils/server-side-only/redirect-to-destination-while-authed'

type LoginPageProps = Record<string, unknown> & {
  isWebview: boolean
  headerData: {
    flashNewsData: ShellFlashNews[]
    sectionsData: HeadersData
    topicsData: Topics
  }
}

export default function Login({ headerData, isWebview }: LoginPageProps) {
  return (
    <LayoutFull
      head={{ robotsMetaContent: 'noindex, nofollow', skipCanonical: true }}
      header={{ type: 'default', data: headerData }}
    >
      <div className="grow bg-white md:bg-mm-neutral-100">
        <LoginPageContent isWebview={isWebview} />
      </div>
    </LayoutFull>
  )
}

export const getServerSideProps: GetServerSideProps<LoginPageProps> =
  redirectToDestinationWhileAuthed()<LoginPageProps>(async ({ req, res }) => {
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
      'Error occurs while getting header data in login page',
      globalLogFields
    )

    return {
      props: {
        isWebview: isInAppBrowser(req.headers['user-agent'] ?? ''),
        headerData: { flashNewsData, sectionsData, topicsData },
      },
    }
  })
