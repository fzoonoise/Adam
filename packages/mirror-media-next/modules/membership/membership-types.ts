type MemberType =
  | 'not-member'
  | 'basic-member'
  | 'premium-member'
  | 'one-time-member'

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
