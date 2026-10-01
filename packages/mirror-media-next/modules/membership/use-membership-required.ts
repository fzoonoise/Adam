import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'

import { getLoginHref } from '@/utils'

import { useMembership } from './membership-context'
import type { MemberInfo } from './membership-types'

type MembershipValidator = (memberInfo: MemberInfo | undefined) => boolean

type UseMembershipRequiredOptions = {
  skipCheck?: boolean
}

/**
 * Client-side authentication handle.
 * It is useful when membership state changed but page didn't reloaded.
 */
export default function useMembershipRequired(
  validator?: MembershipValidator,
  { skipCheck }: UseMembershipRequiredOptions = {}
) {
  const router = useRouter()
  const { isLoggedIn, memberInfo, isLogInProcessFinished } = useMembership()

  const isValidMember = useMemo(
    () => (typeof validator === 'function' ? validator(memberInfo) : true),
    [memberInfo, validator]
  )

  useEffect(() => {
    if (skipCheck) return

    if (isLogInProcessFinished && (!isLoggedIn || !isValidMember)) {
      const redirectionTarget = getLoginHref(router)
      router.push(redirectionTarget)
    }
  }, [router, isLogInProcessFinished, isLoggedIn, isValidMember, skipCheck])
}
