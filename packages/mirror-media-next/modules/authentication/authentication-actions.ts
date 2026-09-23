import type { FirebaseError } from 'firebase/app'
import type { User } from 'firebase/auth'

import client from '@/apollo/apollo-client'
import { createMember } from '@/apollo/membership/mutation/member'
import { fetchAllMember } from '@/apollo/membership/query/member'
import type {
  Membership,
  MemberType,
} from '@/modules/membership/membership-types'
import { generateErrorReportInfo } from '@/utils/log/error-log'
import { sendErrorLog } from '@/utils/log/send-log'

import { FormState, type LoginFormState } from './authentication-state'

type AccessToken = Membership['accessToken']
type ErrorPayload = {
  memberType?: MemberType
  userEmail?: string | null
  firebaseId?: string
  isMemberArticle?: boolean
}

/**
 * there are 3 error situation:
 * 1: has firebase auth, but no member data in Israfel(login)
 * 2: has created new firebase auth, but member email is duplicated (regiser)
 * 3: some server error
 * in situation 1 and 2:
 * we need to delete this member's firebase account
 * in situation3:
 * do nothing with the firebase auth object
 */
const errorHandler = async (
  error: Error | FirebaseError,
  payload?: ErrorPayload
): Promise<void> => {
  const [{ auth }, { signOut }] = await Promise.all([
    import('@/firebase'),
    import('firebase/auth'),
  ])
  const currentUser = auth.currentUser
  if (
    error?.message === "GraphQL error: Can't find data in Israfel" ||
    error?.message === "this member's email has been used in Israfel"
  ) {
    currentUser?.delete()
  }

  const errorLog = generateErrorReportInfo(
    error,
    payload ?? {
      userEmail: currentUser?.email,
      firebaseId: currentUser?.uid,
    }
  )
  sendErrorLog(errorLog)

  await signOut(auth)
}

/**
 * This function would create member in Israfel.
 */
const createMemberDataInIsrafel = async (
  accessToken: AccessToken,
  email: string | null,
  firebaseId: string
): Promise<void> => {
  try {
    await client.mutate({
      mutation: createMember,
      context: {
        uri: '/member/graphql',
        headers: {
          authorization: accessToken ? `Bearer ${accessToken}` : '',
        },
      },
      variables: {
        firebaseId: firebaseId,
        email: email as string,
      },
    })
  } catch (error) {
    const errorMessage =
      (error as Error).message.search(
        'Unique constraint failed on the fields'
      ) !== -1
        ? "this member's email has been used in Israfel"
        : (error as Error).message

    throw new Error(errorMessage)
  }
}
/**
 * This function fetches basic member information in Israfel.
 * This function would query information of certain member to check if they exist in Israfel.
 * if the member data is found successfully, it is no need to return result, as the data is not needed
 * for other purposes currently, such as store data in Redux.
 * If we need to store it in the future, feel free to modify this function to return query result if needed.
 * @async
 * @throws {Error} Throws an error if the GraphQL query fails or if certain member data is not found.
 */
const fetchBasicMemberInfoInIsrafel = async (
  firebaseUid: string
): Promise<void> => {
  try {
    const result = await client.query({
      query: fetchAllMember,
      context: { uri: '/member/graphql' },
      variables: {
        firebaseId: firebaseUid,
      },
    })
    const memberData = result?.data?.member
    if (!memberData) {
      throw "GraphQL error: Can't find data in Israfel, please check if this member's data existed in Israfel"
    }
  } catch (error) {
    throw new Error(error as string)
  }
}

const loginPageOnAuthStateChangeAction = async (
  firebaseAuthUser: User,
  isNewUser: boolean,
  accessToken: AccessToken = ''
): Promise<LoginFormState> => {
  if (!accessToken) {
    throw new Error(
      "Error occurred at function `loginPageOnAuthStateChangeAction`: Required parameter 'accessToken' is missing."
    )
  }
  const userUid = firebaseAuthUser.uid

  /**
   * If it is a new user(register by email/password or first login by 3 party login), create it member is Israfel
   * If not, then query member basic info to check if certain member is existed in Israfel
   */
  if (isNewUser) {
    const userEmail = firebaseAuthUser.email
    await createMemberDataInIsrafel(accessToken, userEmail, userUid)
    return FormState.RegisterSuccess
  } else {
    await fetchBasicMemberInfoInIsrafel(userUid)
    return FormState.LoginSuccess
  }
}

export { errorHandler, loginPageOnAuthStateChangeAction }
