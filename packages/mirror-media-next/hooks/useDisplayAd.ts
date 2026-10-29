import { useMembership } from '../modules/membership/membership-context'

/**
 * hiddenAdvertised: `Posts` 的「google廣告違規」欄位是否有被勾選（如有勾選則不顯示所有廣告）
 */
export const useDisplayAd = (hiddenAdvertised = false) => {
  const { memberInfo, isLogInProcessFinished, isLoggedIn } = useMembership()
  const { memberType } = memberInfo

  //When the user's member type is 'not-member', 'one-time-member', or 'basic-member', the AD should be displayed.
  const invalidMemberType = ['not-member', 'one-time-member', 'basic-member']

  const shouldShowAd = Boolean(
    !hiddenAdvertised &&
    isLogInProcessFinished &&
    invalidMemberType.includes(memberType)
  )

  return { shouldShowAd, isLogInProcessFinished, isLoggedIn }
}
