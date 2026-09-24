import type { GetServerSideProps } from 'next'

import FormWrapper from '../../components/common/form-wrapper'
import LayoutFull from '../../components/shared/layout-full'
import { Typography } from '../../components/ui/typography'
import MainForm from '../../modules/authentication/components/update-password-form'
import useMembershipRequired from '../../modules/membership/use-membership-required'
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
import redirectToLoginWhileUnauthed from '../../utils/server-side-only/redirect-to-login-while-unauthed'

type UpdatePasswordPageProps = Record<string, unknown> & {
  headerData: {
    flashNewsData: ShellFlashNews[]
    sectionsData: HeadersData
    topicsData: Topics
  }
}

export default function UpdatePassword({
  headerData,
}: UpdatePasswordPageProps) {
  useMembershipRequired()

  return (
    <LayoutFull header={{ type: 'default', data: headerData }}>
      <div className="grow bg-white md:bg-mm-neutral-100">
        <main className="flex flex-col items-center">
          <FormWrapper>
            <Typography
              as="p"
              className="leading-normal font-medium text-mm-neutral-800"
              variant="h3"
            >
              變更密碼
            </Typography>
            <MainForm />
          </FormWrapper>
        </main>
      </div>
    </LayoutFull>
  )
}

export const getServerSideProps: GetServerSideProps<UpdatePasswordPageProps> =
  redirectToLoginWhileUnauthed()<UpdatePasswordPageProps>(async ({
    req,
    res,
    user,
  }) => {
    setPageCache(res, { cachePolicy: 'no-store' }, req.url)

    const globalLogFields: Record<string, unknown> = {
      ...getLogTraceObject(req),
    }
    const signInProvider = user?.firebase?.sign_in_provider

    if (signInProvider !== 'password') {
      return {
        redirect: { statusCode: 307, destination: '/profile' },
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
      'Error occurs while getting header data in update password page',
      globalLogFields
    )

    return {
      props: {
        headerData: { flashNewsData, sectionsData, topicsData },
      },
    }
  })
