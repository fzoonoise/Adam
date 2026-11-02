import type { User } from 'firebase/auth'

import client from '@/apollo/apollo-client'
import { createMember } from '@/apollo/membership/mutation/member'
import { fetchAllMember } from '@/apollo/membership/query/member'
import type { Membership } from '@/modules/membership/membership-types'
import { generateErrorReportInfo } from '@/utils/log/error-log'
import { sendErrorLog } from '@/utils/log/send-log'
import type { LogContextPayload } from '@/utils/log/shared'
import { normalizeError } from '@/utils/normalize-error'

import { FormState, type LoginFormState } from './authentication-state'

type AccessToken = Membership['accessToken']

const IsrafelErrorCode = {
  MemberNotFound: 'israfel/member-not-found',
  EmailAlreadyUsed: 'israfel/email-already-used',
} as const

type IsrafelErrorCode = (typeof IsrafelErrorCode)[keyof typeof IsrafelErrorCode]

// Follows the FirebaseError `code` convention used by the same login flow.
// Consumers branch on `code`; the error keeps a plain `Error` name and the
// existing log message.
const createIsrafelError = (
  code: IsrafelErrorCode,
  message: string,
  options?: ErrorOptions
) => Object.assign(new Error(message, options), { code })

const hasIsrafelErrorCode = (error: unknown, code: IsrafelErrorCode) =>
  error instanceof Error && 'code' in error && error.code === code

/**
 * there are 3 error situation:
 * 1: has firebase auth, but no member data in Israfel(login)
 * 2: has created new firebase auth, but member email is duplicated (registration)
 * 3: some server error
 * in situation 2:
 * we need to delete this member's firebase account
 * in situation 1 and 3:
 * do nothing with the firebase auth object
 *
 * Situation 1 deliberately keeps the Firebase account. The Firebase project is
 * shared with the Nuxt app, and deleting the account cannot be undone, so
 * enabling deletion for a missing Israfel member needs a separate decision.
 */
const errorHandler = async (
  error: Error,
  payload?: LogContextPayload
): Promise<void> => {
  const [{ auth }, { signOut }] = await Promise.all([
    import('@/firebase'),
    import('firebase/auth'),
  ])
  const currentUser = auth.currentUser
  if (hasIsrafelErrorCode(error, IsrafelErrorCode.EmailAlreadyUsed)) {
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
  if (!email) {
    throw new Error('Firebase user email is required to create member data.')
  }

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
        email,
      },
    })
  } catch (error) {
    const normalizedError = normalizeError(error)
    if (
      normalizedError.message.includes('Unique constraint failed on the fields')
    ) {
      throw createIsrafelError(
        IsrafelErrorCode.EmailAlreadyUsed,
        "this member's email has been used in Israfel",
        { cause: normalizedError }
      )
    }

    throw new Error(normalizedError.message)
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
  firebaseUid: string,
  accessToken: AccessToken
): Promise<void> => {
  try {
    const result = await client.query({
      query: fetchAllMember,
      context: {
        uri: '/member/graphql',
        headers: {
          authorization: accessToken ? `Bearer ${accessToken}` : '',
        },
      },
      variables: {
        firebaseId: firebaseUid,
      },
    })
    const memberData = result?.data?.member
    if (!memberData) {
      throw createIsrafelError(
        IsrafelErrorCode.MemberNotFound,
        "GraphQL error: Can't find data in Israfel, please check if this member's data existed in Israfel"
      )
    }
  } catch (error) {
    if (hasIsrafelErrorCode(error, IsrafelErrorCode.MemberNotFound)) throw error
    throw new Error(String(error))
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
    await fetchBasicMemberInfoInIsrafel(userUid, accessToken)
    return FormState.LoginSuccess
  }
}

export { errorHandler, loginPageOnAuthStateChangeAction }
