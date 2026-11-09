import { useRef, useState } from 'react'
import { FirebaseError } from 'firebase/app'
import { createUserWithEmailAndPassword } from 'firebase/auth'

import { FirebaseAuthError } from '@/constants/firebase'
import { auth } from '@/firebase'
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux'
import { getAccessToken } from '@/modules/membership/membership-token'
import { isCompanyEmail, isValidEmail } from '@/utils'
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
import { isValidNewPassword } from '../password-policy'

import FormTitle from './form-title'
import Hint from './input-hint'
import PrimaryButton from './primary-button'
import RegistrationEmailInput from './registration-email-input'
import RegistrationPasswordInput from './registration-password-input'

type MainFormRegistrationProps = {
  onSubmittingChange?: (pending: boolean) => void
}

export default function MainFormRegistration({
  onSubmittingChange,
}: MainFormRegistrationProps) {
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const isSubmitting = useRef(false)
  const email = useAppSelector(loginEmail)
  const password = useAppSelector(loginPassword)
  const isFederatedRedirectResultLoading = useAppSelector(
    loginIsFederatedRedirectResultLoading
  )
  const allowToSubmit =
    isValidEmail(email) &&
    isValidNewPassword(password) &&
    !isCompanyEmail(email) &&
    !isFederatedRedirectResultLoading

  const handleSubmit = async () => {
    if (!allowToSubmit || isSubmitting.current) return
    isSubmitting.current = true
    setIsLoading(true)
    onSubmittingChange?.(true)

    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )
      const idToken = await user.getIdToken()
      if (!idToken)
        throw new Error('Unexpected Error when getting firebase Id token.')
      const accessToken = await getAccessToken(idToken)
      const result = await loginPageOnAuthStateChangeAction(
        user,
        true,
        accessToken
      )
      dispatch(loginActions.changeState(result))
    } catch (error) {
      if (
        !(
          error instanceof FirebaseError &&
          error.code === FirebaseAuthError.EMAIL_ALREADY_IN_USE
        )
      ) {
        void errorHandler(normalizeError(error), { userEmail: email })
      }
      dispatch(loginActions.changeState(FormState.RegisterFail))
    } finally {
      isSubmitting.current = false
      setIsLoading(false)
      onSubmittingChange?.(false)
    }
  }

  return (
    <>
      <FormTitle>Email 註冊</FormTitle>
      <Hint className="mb-4" state={InputState.Start}>
        若要使用 Facebook、Google 或 Apple
        帳號註冊，請切換至上方「登入」，選擇對應的第三方登入方式即可。
      </Hint>
      <div className="flex flex-col">
        <RegistrationEmailInput />
        <RegistrationPasswordInput />
      </div>
      <div className="mb-4 flex flex-col gap-3">
        <PrimaryButton
          isLoading={isLoading}
          disabled={!allowToSubmit}
          onClick={handleSubmit}
        >
          註冊會員
        </PrimaryButton>
      </div>
    </>
  )
}
