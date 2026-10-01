import { useEffect } from 'react'
import { FirebaseError } from 'firebase/app'
import {
  fetchSignInMethodsForEmail,
  getAdditionalUserInfo,
  getRedirectResult,
} from 'firebase/auth'

import { FirebaseAuthError } from '@/constants/firebase'
import { auth } from '@/firebase'
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux'
import { useMembership } from '@/modules/membership/membership-context'
import { normalizeError } from '@/utils/normalize-error'

import {
  errorHandler,
  loginPageOnAuthStateChangeAction,
} from '../authentication-actions'
import {
  AuthMethod,
  FormState,
  loginActions,
  loginState,
} from '../authentication-state'
import useRedirect from '../use-authentication-redirect'

import LoginFailed from './login-failed'
import MainForm from './main-form'
import RegistrationFailed from './registration-failed'
import RegistrationSuccess from './registration-success'
import WebviewHint from './webview-hint'

type LoginPageContentProps = {
  isWebview: boolean
}

const getPreviousAuthMethod = (providerId?: string): string => {
  switch (providerId) {
    case 'google.com':
      return AuthMethod.Google
    case 'facebook.com':
      return AuthMethod.Facebook
    case 'apple.com':
      return AuthMethod.Apple
    case 'password':
      return AuthMethod.Email
    default:
      return providerId ?? AuthMethod.Default
  }
}

export default function LoginPageContent({ isWebview }: LoginPageContentProps) {
  const dispatch = useAppDispatch()
  const { accessToken, isLogInProcessFinished, userEmail } = useMembership()
  const loginFormState = useAppSelector(loginState)
  const { redirect } = useRedirect()

  useEffect(() => {
    if (!isLogInProcessFinished || isWebview) return

    const handleFederatedRedirectResult = async () => {
      try {
        const redirectResult = await getRedirectResult(auth)
        if (redirectResult?.user) {
          const additionalUserInfo = getAdditionalUserInfo(redirectResult)
          if (!additionalUserInfo) {
            throw new Error('Unable to get Firebase additional user info')
          }
          await loginPageOnAuthStateChangeAction(
            redirectResult.user,
            additionalUserInfo.isNewUser,
            accessToken
          )
          redirect()
        }
      } catch (error) {
        if (
          error instanceof FirebaseError &&
          error.code ===
            FirebaseAuthError.ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL
        ) {
          const email =
            typeof error.customData?.email === 'string'
              ? error.customData.email
              : ''
          const signInMethods = await fetchSignInMethodsForEmail(auth, email)

          dispatch(
            loginActions.changePrevAuthMethod(
              getPreviousAuthMethod(signInMethods[0])
            )
          )
          dispatch(
            loginActions.changeShouldShowHintOfExistenceOfDifferentAuthMethod(
              true
            )
          )
        } else {
          void errorHandler(normalizeError(error), { userEmail })
          dispatch(loginActions.changeState(FormState.LoginFail))
        }
      } finally {
        dispatch(loginActions.changeIsFederatedRedirectResultLoading(false))
      }
    }

    void handleFederatedRedirectResult()
  }, [
    isLogInProcessFinished,
    accessToken,
    redirect,
    dispatch,
    userEmail,
    isWebview,
  ])

  if (isWebview) {
    return <WebviewHint />
  }

  switch (loginFormState) {
    case FormState.Form:
      return <MainForm />
    case FormState.RegisterSuccess:
      return <RegistrationSuccess />
    case FormState.LoginSuccess:
      return <>登入成功</>
    case FormState.RegisterFail:
      return <RegistrationFailed />
    case FormState.LoginFail:
      return <LoginFailed />
    default: {
      // Every login state must be handled above.
      const unhandledState: never = loginFormState
      throw new Error(`Unexpected login form state: ${String(unhandledState)}`)
    }
  }
}
