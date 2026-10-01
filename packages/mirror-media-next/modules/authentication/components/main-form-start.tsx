import { useState } from 'react'
import { fetchSignInMethodsForEmail } from 'firebase/auth'

import { auth } from '@/firebase'
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux'
import { isCompanyEmail, isValidEmail } from '@/utils'

import { InputState } from '../authentication-form'
import {
  AuthMethod,
  loginActions,
  loginEmail,
  loginIsFederatedRedirectResultLoading,
  loginPrevAuthMethod,
  loginShouldShowHintOfExistenceOfDifferentAuthMethod,
  type ThirdPartyAuthMethod,
} from '../authentication-state'

import ButtonLoginWithThirdParty from './button-login-with-third-party'
import CenteredHint from './centered-input-hint'
import EmailInput from './email-input'
import PrimaryButton from './primary-button'
import ReminderSection from './reminder-section'

const THIRD_PARTY_LIST: ThirdPartyAuthMethod[] = [
  AuthMethod.Facebook,
  AuthMethod.Google,
  AuthMethod.Apple,
]

export default function MainFormStart() {
  const [isLoading, setIsLoading] = useState(false)
  const dispatch = useAppDispatch()
  const email = useAppSelector(loginEmail)
  const prevAuthMethod = useAppSelector(loginPrevAuthMethod)
  const isFederatedRedirectResultLoading = useAppSelector(
    loginIsFederatedRedirectResultLoading
  )
  const shouldShowHintOfExistenceOfDifferentAuthMethod = useAppSelector(
    loginShouldShowHintOfExistenceOfDifferentAuthMethod
  )
  const shouldShowHintOfCompanyEmail = isCompanyEmail(email)
  const allowToContinue =
    isValidEmail(email) &&
    !isFederatedRedirectResultLoading &&
    !shouldShowHintOfCompanyEmail

  const handleOnClick = async () => {
    if (!allowToContinue || isLoading) return
    setIsLoading(true)

    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email)

      if (signInMethods.includes('password')) {
        dispatch(loginActions.goToLoginForm())
      } else if (signInMethods.includes('google.com')) {
        dispatch(loginActions.setSignInWithGoogle())
      } else if (signInMethods.includes('facebook.com')) {
        dispatch(loginActions.setSignInWithFacebook())
      } else if (signInMethods.includes('apple.com')) {
        dispatch(loginActions.setSignInWithApple())
      } else {
        dispatch(loginActions.goToRegistrationForm())
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {THIRD_PARTY_LIST.map((thirdPartyName) => (
          <ButtonLoginWithThirdParty
            key={thirdPartyName}
            thirdPartyName={thirdPartyName}
          />
        ))}
        {shouldShowHintOfExistenceOfDifferentAuthMethod && (
          <CenteredHint state={InputState.Invalid}>
            由於您曾以 {prevAuthMethod} 帳號登入，請點擊上方「使用{' '}
            {prevAuthMethod} 帳號繼續」重試。
          </CenteredHint>
        )}
        {shouldShowHintOfCompanyEmail && (
          <CenteredHint state={InputState.Invalid}>
            若您想以本公司企業信箱登入，請點擊上方「使用 Google
            帳號繼續」重試，以享有 Premium 會員資格。
          </CenteredHint>
        )}
      </div>
      <div className="my-4 flex items-center font-mm-sans text-mm-caption-s text-mm-neutral-400 before:h-px before:grow before:bg-mm-neutral-200 after:h-px after:grow after:bg-mm-neutral-200">
        <span className="mx-3">或</span>
      </div>
      <div className="flex flex-col gap-6">
        <EmailInput shouldShowHint={false} />
        <PrimaryButton
          isLoading={isLoading}
          disabled={!allowToContinue}
          onClick={handleOnClick}
        >
          下一步
        </PrimaryButton>
        <ReminderSection />
      </div>
    </>
  )
}
