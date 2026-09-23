import type { GetServerSideProps } from 'next'

import LayoutFull from '../../components/shared/layout-full'
import RecoverPasswordForm from '../../modules/authentication/components/recover-password-form'
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

type RecoverPasswordPageProps = Record<string, unknown> & {
  emailData: string
  headerData: {
    flashNewsData: ShellFlashNews[]
    sectionsData: HeadersData
    topicsData: Topics
  }
}

export default function RecoverPassword({
  emailData,
  headerData,
}: RecoverPasswordPageProps) {
  return (
    <LayoutFull header={{ type: 'default', data: headerData }}>
      <div className="grow bg-white md:bg-mm-neutral-100">
        <main className="flex flex-col items-center">
          <RecoverPasswordForm initialEmail={emailData} />
        </main>
      </div>
    </LayoutFull>
  )
}

export const getServerSideProps: GetServerSideProps<RecoverPasswordPageProps> =
  redirectToDestinationWhileAuthed()<RecoverPasswordPageProps>(async ({
    req,
    res,
    query,
  }) => {
    setPageCache(res, { cachePolicy: 'no-store' }, req.url)

    const globalLogFields: Record<string, unknown> = {
      ...getLogTraceObject(req),
    }
    const { email } = query
    const emailData = Array.isArray(email) ? email.join(',') : (email ?? '')
    const responses = await Promise.allSettled([
      fetchHeaderDataInDefaultPageLayout(),
    ])
    const [sectionsData, topicsData, flashNewsData] = processSettledResult<
      Awaited<ReturnType<typeof fetchHeaderDataInDefaultPageLayout>>,
      ReturnType<typeof getSectionAndTopicFromDefaultHeaderData>
    >(
      responses[0],
      getSectionAndTopicFromDefaultHeaderData,
      'Error occurs while getting header data in recover password page',
      globalLogFields
    )

    return {
      props: {
        emailData,
        headerData: { flashNewsData, sectionsData, topicsData },
      },
    }
  })
