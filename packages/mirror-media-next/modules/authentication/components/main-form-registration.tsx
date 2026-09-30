import { type MouseEventHandler, useState } from 'react'
import { FirebaseError } from 'firebase/app'
import { createUserWithEmailAndPassword } from 'firebase/auth'

import { FirebaseAuthError } from '@/constants/firebase'
import { auth } from '@/firebase'
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux'
import { getAccessToken } from '@/modules/membership/membership-token'
import { isValidEmail, isValidPassword } from '@/utils'
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
  loginPassword,
} from '../authentication-state'

import CenteredHint from './centered-input-hint'
import DefaultButton from './default-button'
import FormTitle from './form-title'
import PrimaryButton from './primary-button'
import RegistrationEmailInput from './registration-email-input'
import RegistrationPasswordInput from './registration-password-input'
import ReminderSection from './reminder-section'

export default function MainFormRegistration() {
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const [isDuplicateEmailMember, setIsDuplicateEmailMember] = useState(false)
  const email = useAppSelector(loginEmail)
  const password = useAppSelector(loginPassword)
  const allowToSubmit = isValidEmail(email) && isValidPassword(password)

  const handleBack: MouseEventHandler<HTMLButtonElement> = () => {
    setIsDuplicateEmailMember(false)
    dispatch(loginActions.goToStart())
  }

  const handleSubmit: MouseEventHandler<HTMLButtonElement> = async () => {
    if (isLoading) return
    setIsLoading(true)

    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )
      const idToken = await user.getIdToken()
      if (!idToken) {
        throw new Error('Unexpected Error when getting firebase Id token.')
      }
      const accessToken = await getAccessToken(idToken)
      const result = await loginPageOnAuthStateChangeAction(
        user,
        true,
        accessToken
      )

      dispatch(loginActions.changeState(result))
    } catch (error) {
      if (
        error instanceof FirebaseError &&
        error.code === FirebaseAuthError.EMAIL_ALREADY_IN_USE
      ) {
        setIsDuplicateEmailMember(true)
      } else {
        void errorHandler(normalizeError(error), { userEmail: email })
        dispatch(loginActions.changeState(FormState.RegisterFail))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <FormTitle>Email 註冊</FormTitle>
      <div className="flex flex-col gap-4">
        <RegistrationEmailInput />
        <RegistrationPasswordInput />
      </div>
      <div className="my-6 flex flex-col gap-3">
        {isDuplicateEmailMember && (
          <CenteredHint state={InputState.Invalid}>
            這個 Email 已經註冊過囉
          </CenteredHint>
        )}
        <PrimaryButton
          isLoading={isLoading}
          disabled={!allowToSubmit}
          onClick={handleSubmit}
        >
          註冊會員
        </PrimaryButton>
        <DefaultButton onClick={handleBack}>回上一步</DefaultButton>
      </div>
      <ReminderSection />
    </>
  )
}
