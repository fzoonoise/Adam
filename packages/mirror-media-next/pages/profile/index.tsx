import { useState } from 'react'
import type { GetServerSideProps } from 'next'

import LayoutFull from '../../components/shared/layout-full'
import { Typography } from '../../components/ui/typography'
import type { SaveResult } from '../../modules/account/account-types'
import SaveFailed from '../../modules/account/components/save-failed'
import SaveSuccess from '../../modules/account/components/save-success'
import UserDeletionForm from '../../modules/account/components/user-deletion-form'
import UserProfileForm from '../../modules/account/components/user-profile-form'
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

const MODE = {
  FORM: 'form',
  SUCCESS: 'success',
  FAIL: 'fail',
} as const

type ProfileProps = Record<string, unknown> & {
  headerData: {
    flashNewsData: ShellFlashNews[]
    sectionsData: HeadersData
    topicsData: Topics
  }
  signInProvider?: string
}

type SavedStatus = (typeof MODE)[keyof typeof MODE]

export default function Profile({ headerData, signInProvider }: ProfileProps) {
  useMembershipRequired()
  const [savedStatus, setSavedStatus] = useState<SavedStatus>(MODE.FORM)

  const handleSaved = (status: SaveResult) => {
    setSavedStatus(status)
  }

  const resetStatus = () => {
    setSavedStatus(MODE.FORM)
  }

  return (
    <LayoutFull
      head={{ title: `個人資料` }}
      header={{
        type: 'default',
        data: headerData,
      }}
    >
      {savedStatus === MODE.FORM && (
        <main className="mx-auto w-full max-w-149 overflow-x-hidden px-5 py-10 md:w-150 md:max-w-none md:overflow-x-visible md:px-0 md:py-15 xl:w-170">
          <Typography
            as="h1"
            className="mb-6 leading-9 font-medium md:mb-3"
            variant="h3"
          >
            個人資料
          </Typography>
          <UserProfileForm
            onSaved={handleSaved}
            signInProvider={signInProvider}
          />
          <UserDeletionForm />
        </main>
      )}

      {savedStatus === MODE.SUCCESS && (
        <div className="grow bg-white md:bg-mm-neutral-100">
          <SaveSuccess onReset={resetStatus} />
        </div>
      )}
      {savedStatus === MODE.FAIL && (
        <div className="grow bg-white md:bg-mm-neutral-100">
          <SaveFailed onReset={resetStatus} />
        </div>
      )}
    </LayoutFull>
  )
}

export const getServerSideProps: GetServerSideProps<ProfileProps> =
  redirectToLoginWhileUnauthed()<ProfileProps>(async ({ req, res, user }) => {
    setPageCache(res, { cachePolicy: 'no-store' }, req.url)

    const globalLogFields: Record<string, unknown> = {
      ...getLogTraceObject(req),
    }

    const signInProvider = user?.firebase?.sign_in_provider

    const responses = await Promise.allSettled([
      fetchHeaderDataInDefaultPageLayout(),
    ])

    // handle header data
    const [sectionsData, topicsData, flashNewsData] = processSettledResult<
      Awaited<ReturnType<typeof fetchHeaderDataInDefaultPageLayout>>,
      ReturnType<typeof getSectionAndTopicFromDefaultHeaderData>
    >(
      responses[0],
      getSectionAndTopicFromDefaultHeaderData,
      'Error occurs while getting header data in profile page',
      globalLogFields
    )

    return {
      props: {
        signInProvider: signInProvider,
        headerData: { flashNewsData, sectionsData, topicsData },
      },
    }
  })
