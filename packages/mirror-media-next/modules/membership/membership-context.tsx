import type { Dispatch, ReactElement, ReactNode } from 'react'
import { createContext, useContext, useEffect, useReducer } from 'react'
import type { User } from 'firebase/auth'

import { generateErrorReportInfo } from '@/utils/log/error-log'
import { sendErrorLog } from '@/utils/log/send-log'
import { normalizeError } from '@/utils/normalize-error'

import {
  getAccessToken,
  getMemberTypeFromAccessToken,
  removeAccessTokenFromStorage,
} from './membership-token'
import type {
  Membership,
  MembershipReducerAction,
  MemberType,
} from './membership-types'

/**
 * TODO: check which data should be stored, such as user email, is email verified, etc.
 */
const initialMembership: Membership = {
  isLoggedIn: false,
  accessToken: '',
  userEmail: '',
  memberInfo: { memberType: 'not-member' },
  isLogInProcessFinished: false,
  firebaseId: '',
}

const MembershipContext = createContext(initialMembership)

const MembershipDispatchContext =
  createContext<Dispatch<MembershipReducerAction> | null>(null)

const membershipReducer = (
  membership: Membership,
  action: MembershipReducerAction
): Membership => {
  const { memberInfo } = membership
  const isLogInProcessFinished = true
  switch (action.type) {
    case 'LOGIN': {
      const {
        memberInfo: { memberType = 'not-member' } = {},
        accessToken = '',
        userEmail = '',
        firebaseId = '',
      } = action?.payload ?? {}
      return {
        isLoggedIn: true,
        accessToken: accessToken,
        userEmail,
        memberInfo: {
          ...memberInfo,
          memberType: memberType,
        },
        isLogInProcessFinished,
        firebaseId,
      }
    }
    case 'LOGOUT':
      return {
        isLoggedIn: false,
        accessToken: '',
        userEmail: '',
        memberInfo: {
          memberType: 'not-member',
        },
        isLogInProcessFinished,
        firebaseId: '',
      }

    default: {
      const unhandledAction: never = action.type
      throw Error('Unknown action: ' + unhandledAction)
    }
  }
}

/**
 * The context provider for managing membership state.
 * The provider not only manage membership state, but also login membership if needed.
 * The process of login membership contain five steps:
 * 1. Add an observer `auth.onAuthStateChanged` to detect whether firebase is sign-in or not.
 * 2. If firebase is sign-in, then get firebase id token.
 * 3. If successfully get firebase id token, then get Access Token, which is sign by WAS (weekly-api-server).
 * 4. If successfully get Access Token, then dispatch a `LOGIN` action, which will store value of Access Token.
 * 5. If firebase is NOT sign-in, or firebase id token is verified invalid by WAS, then dispatch a `LOGOUT` action, which will clear the value of Access Token which previously stored.
 *
 * Please remind two things:
 * 1. "Get Access Token" is an essential piece for login process: if user couldn't get Access Token, it should not be treated as login completely.
 * 2. Sign-in/sign-out to firebase is only part of the login/logout process:
 *    - After firebase sign-in, it is needed get Access token, and dispatch a "LOGIN" action to store access token.
 *    - After firebase sign-out, it is needed to dispatch a "LOGOUT" action to clear access token.
 */
const MembershipProvider = ({
  children,
}: {
  children: ReactNode
}): ReactElement => {
  const [membership, dispatch] = useReducer(
    membershipReducer,
    initialMembership
  )

  useEffect(() => {
    let isMounted = true
    let unsubscribeAuthStateChanged = () => {}

    /**
     * Use function `getIdToken` to get a Firebase JWT Token
     * Return a token string if success, return null if failed.
     * If return `null`, which means some unexpected error occurred on Firebase.
     * @see https://firebase.google.com/docs/reference/js/auth.user.md#usergetidtoken
     */
    const getIdToken = async (user: User): Promise<string | null> => {
      try {
        const idToken = await user.getIdToken()
        return idToken
      } catch (err) {
        const errorLog = generateErrorReportInfo(normalizeError(err), {
          userEmail: user.email,
          firebaseId: user.uid,
        })
        sendErrorLog(errorLog)

        return null
      }
    }

    const getMemberType = (accessToken: string, user: User): MemberType => {
      try {
        return getMemberTypeFromAccessToken(accessToken)
      } catch (e) {
        const errorLog = generateErrorReportInfo(normalizeError(e), {
          userEmail: user.email,
          firebaseId: user.uid,
        })
        sendErrorLog(errorLog)

        return 'not-member'
      }
    }

    const handleFirebaseAuthStateChanged = async (user: User | null) => {
      const [{ auth }, { signOut }] = await Promise.all([
        import('@/firebase'),
        import('firebase/auth'),
      ])

      if (user) {
        const idToken = await getIdToken(user)

        if (!idToken) {
          return
        }

        /**
         * Get user Access Token.
         * Access Token is generated by WAS(weekly-api-server).
         * It is need to send post request to `/access-token` and set Firebase id token as a authorization header,
         * WAS will verify Firebase id token and return Access Token if success.
         * By using Access Token, user can access information of certain member account, read member article if has corresponding permissions.
         * @see https://github.com/mirror-media/Adam/blob/dev/packages/weekly-api-server/README.md
         */
        try {
          const accessToken = await getAccessToken(idToken)
          const memberType = getMemberType(accessToken, user)

          if (accessToken) {
            dispatch({
              type: 'LOGIN',
              payload: {
                accessToken,
                memberInfo: { memberType },
                userEmail: user.email,
                firebaseId: user.uid,
              },
            })
            console.log('Has access token, hurray!')
          }
        } catch (error) {
          /**
           * There are two situations that need to be handled:
           * 1. Firebase id Token is verified by WAS, but it is an invalid id token. The status code is 401.
           * 2. WAS has some unexpected error, such as unable to sign in JWT token, or unable to request GQL server. The status code is 500.
           */
          const statusCode = (
            error as { response?: { status?: number } } | null
          )?.response?.status
          switch (statusCode) {
            case 401:
              //Logout firebase
              signOut(auth)
              break
            case 500:
            default: {
              const errorLog = generateErrorReportInfo(normalizeError(error), {
                userEmail: user.email,
                firebaseId: user.uid,
              })
              sendErrorLog(errorLog)
              break
            }
          }
        }
      } else {
        /**
         * If user is not log in firebase, we should dispatch a "LOGOUT" action to clear access token.
         */
        dispatch({ type: 'LOGOUT' })
        removeAccessTokenFromStorage()
      }
    }

    const setupAuthStateChanged = async (): Promise<void> => {
      const { auth } = await import('@/firebase')

      if (!isMounted) {
        return
      }

      unsubscribeAuthStateChanged = auth.onAuthStateChanged(
        handleFirebaseAuthStateChanged
      )
    }

    setupAuthStateChanged()

    return () => {
      isMounted = false
      unsubscribeAuthStateChanged()
    }
  }, [])
  return (
    <MembershipContext.Provider value={membership}>
      <MembershipDispatchContext.Provider value={dispatch}>
        {children}
      </MembershipDispatchContext.Provider>
    </MembershipContext.Provider>
  )
}
/**
 * This context provide the value of property in membership, such as `isLoggedIn`, `accessToken`.
 */
const useMembership = (): Membership => {
  return useContext(MembershipContext)
}

/**
 * This context provide the function that lets components dispatch actions to set value of property in membership.
 */
const useMembershipDispatch = (): Dispatch<MembershipReducerAction> | null => {
  return useContext(MembershipDispatchContext)
}

const handleFirebaseSignOut = async (): Promise<void> => {
  const [{ auth }, { signOut }] = await Promise.all([
    import('@/firebase'),
    import('firebase/auth'),
  ])
  const currentUser = auth.currentUser

  try {
    await signOut(auth)
  } catch (error) {
    const errorLog = generateErrorReportInfo(normalizeError(error), {
      userEmail: currentUser?.email,
      firebaseId: currentUser?.uid,
    })
    sendErrorLog(errorLog)
  }
}
export {
  handleFirebaseSignOut as logout,
  MembershipProvider,
  useMembership,
  useMembershipDispatch,
}
