import { useEffect } from 'react'
import { FirebaseError } from 'firebase/app'
import { getAdditionalUserInfo, getRedirectResult } from 'firebase/auth'

import { FirebaseAuthError } from '@/constants/firebase'
import { auth } from '@/firebase'
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux'
import { useMembership } from '@/modules/membership/membership-context'
import { normalizeError } from '@/utils/normalize-error'

import {
  errorHandler,
  loginPageOnAuthStateChangeAction,
} from '../authentication-actions'
import { FormState, loginActions, loginState } from '../authentication-state'
import useRedirect from '../use-authentication-redirect'

import LoginFailed from './login-failed'
import MainForm from './main-form'
import RegistrationFailed from './registration-failed'
import RegistrationSuccess from './registration-success'
import WebviewHint from './webview-hint'

type LoginPageContentProps = {
  isWebview: boolean
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
          dispatch(loginActions.goToStart())
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
