import { useEffect, useRef, useState } from 'react'
import { FirebaseError } from 'firebase/app'
import { signInWithEmailAndPassword, type UserCredential } from 'firebase/auth'

import { Link } from '@/components/ui/link'
import { FirebaseAuthError } from '@/constants/firebase'
import { auth } from '@/firebase'
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux'
import { getAccessToken } from '@/modules/membership/membership-token'
import { isCompanyEmail, isValidEmail } from '@/utils'
import { generateErrorReportInfo } from '@/utils/log/error-log'
import { sendErrorLog } from '@/utils/log/send-log'
import { normalizeError } from '@/utils/normalize-error'

import {
  errorHandler,
  loginPageOnAuthStateChangeAction,
} from '../authentication-actions'
import { InputState } from '../authentication-form'
import {
  FormState,
  loginActions,
  loginEmail,
  loginIsFederatedRedirectResultLoading,
  loginPassword,
} from '../authentication-state'
import { isValidLoginPassword } from '../password-policy'
import useRedirect from '../use-authentication-redirect'

import EmailInput from './email-input'
import GenericPasswordInput from './password-input'
import PrimaryButton from './primary-button'

const EMAIL_PASSWORD_CREDENTIAL_ERROR_CODES = new Set<string>([
  FirebaseAuthError.USER_NOT_FOUND,
  FirebaseAuthError.WRONG_PASSWORD,
  FirebaseAuthError.INVALID_LOGIN_CREDENTIALS,
  FirebaseAuthError.INVALID_CREDENTIAL,
])

type MainFormLoginWithPasswordProps = {
  onSubmittingChange?: (pending: boolean) => void
}

export default function MainFormLoginWithPassword({
  onSubmittingChange,
}: MainFormLoginWithPasswordProps) {
  const dispatch = useAppDispatch()
  const email = useAppSelector(loginEmail)
  const password = useAppSelector(loginPassword)
  const isFederatedRedirectResultLoading = useAppSelector(
    loginIsFederatedRedirectResultLoading
  )
  const allowToSubmit =
    isValidEmail(email) &&
    isValidLoginPassword(password) &&
    !isCompanyEmail(email) &&
    !isFederatedRedirectResultLoading
  const { redirect } = useRedirect()
  const [passwordErrorCode, setPasswordErrorCode] = useState<string | null>(
    null
  )
  const isRateLimited =
    passwordErrorCode === FirebaseAuthError.TOO_MANY_REQUESTS
  const passwordErrorMessage = passwordErrorCode
    ? isRateLimited
      ? '登入嘗試過於頻繁，請稍後再試。'
      : '帳號或密碼錯誤'
    : ''
  const passwordInputState = passwordErrorCode
    ? InputState.Invalid
    : InputState.Start
  const [isLoading, setIsLoading] = useState(false)
  const isSubmitting = useRef(false)

  useEffect(() => {
    setPasswordErrorCode(null)
  }, [email, password])

  const handleSubmit = async () => {
    if (!allowToSubmit || isSubmitting.current) return
    isSubmitting.current = true
    setIsLoading(true)
    setPasswordErrorCode(null)
    onSubmittingChange?.(true)

    try {
      let credential: UserCredential
      try {
        credential = await signInWithEmailAndPassword(auth, email, password)
      } catch (error) {
        if (
          error instanceof FirebaseError &&
          error.code === FirebaseAuthError.TOO_MANY_REQUESTS
        ) {
          setPasswordErrorCode(error.code)
          try {
            sendErrorLog(generateErrorReportInfo(error, { userEmail: email }))
          } catch (loggingError) {
            console.error(
              'Unable to report Firebase sign-in rate limit.',
              loggingError
            )
          }
          return
        }
        if (
          error instanceof FirebaseError &&
          EMAIL_PASSWORD_CREDENTIAL_ERROR_CODES.has(error.code)
        ) {
          setPasswordErrorCode(error.code)
          return
        }
        throw error
      }

      const { user } = credential
      const idToken = await user.getIdToken()
      if (!idToken)
        throw new Error('Unexpected Error when getting firebase Id token.')
      const accessToken = await getAccessToken(idToken)
      await loginPageOnAuthStateChangeAction(user, false, accessToken)
      redirect()
    } catch (error) {
      void errorHandler(normalizeError(error), { userEmail: email })
      dispatch(loginActions.changeState(FormState.LoginFail))
    } finally {
      isSubmitting.current = false
      setIsLoading(false)
      onSubmittingChange?.(false)
    }
  }

  return (
    <>
      <div className="flex flex-col">
        <EmailInput />
        <GenericPasswordInput
          value={password}
          placeholder="請輸入密碼"
          invalidMessage={passwordErrorMessage}
          showInvalidBorder={!isRateLimited}
          state={passwordInputState}
          onChange={(event) =>
            dispatch(loginActions.setPassword(event.target.value))
          }
        />
        {/* Sits in the password hint row, right-aligned beside any error hint. */}
        <Link
          variant="plain"
          className="-mt-10 flex h-10 items-center self-end text-mm-body2 text-mm-second-500"
          href={{ pathname: '/recover-password', query: { email } }}
        >
          忘記密碼？
        </Link>
      </div>
      <div className="mb-4 flex flex-col gap-3">
        <PrimaryButton
          isLoading={isLoading}
          disabled={!allowToSubmit}
          onClick={handleSubmit}
        >
          登入會員
        </PrimaryButton>
      </div>
    </>
  )
}
