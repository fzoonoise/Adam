/**
 * Role identifier issued by WAS.
 * Known values include `not-member`, `basic-member`, `premium-member`, and
 * `one-time-member`; the contract stays open for premium and staff variants.
 */
type MemberType = string

type MemberInfo = { memberType: MemberType }

type Membership = {
  isLoggedIn: boolean
  accessToken: string
  userEmail: string | null
  firebaseId: string
  memberInfo: MemberInfo
  isLogInProcessFinished: boolean
}

type MembershipReducerAction = {
  type: 'LOGIN' | 'LOGOUT'
  payload?: {
    accessToken?: string
    memberInfo?: MemberInfo
    userEmail?: string | null
    firebaseId?: string
  }
}

export type { MemberInfo, Membership, MembershipReducerAction, MemberType }
