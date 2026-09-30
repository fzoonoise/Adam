import {
  type ChangeEventHandler,
  type MouseEventHandler,
  useState,
} from 'react'
import { FirebaseError } from 'firebase/app'
import { signInWithEmailAndPassword } from 'firebase/auth'

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
import { InputState, type InputStateEnum } from '../authentication-form'
import {
  FormState,
  loginActions,
  loginEmail,
  loginPassword,
} from '../authentication-state'
import useRedirect from '../use-authentication-redirect'

import DefaultButton from './default-button'
import FormTitle from './form-title'
import GenericPasswordInput from './password-input'
import PrimaryButton from './primary-button'
import TextButton from './text-button'

export default function MainFormLoginWithPassword() {
  const dispatch = useAppDispatch()
  const email = useAppSelector(loginEmail)
  const password = useAppSelector(loginPassword)
  const allowToSubmit = isValidEmail(email) && isValidPassword(password)
  const { redirect } = useRedirect()
  const [passwordInputState, setPasswordInputState] = useState<InputStateEnum>(
    InputState.Start
  )
  const [isLoading, setIsLoading] = useState(false)

  const handlePasswordOnChange: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    dispatch(loginActions.setPassword(event.target.value))
  }

  const handleBack: MouseEventHandler<HTMLButtonElement> = () => {
    setPasswordInputState(InputState.Start)
    dispatch(loginActions.goToStart())
  }

  const handleSubmit: MouseEventHandler<HTMLButtonElement> = async () => {
    if (isLoading) return
    setIsLoading(true)

    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password)
      const idToken = await user.getIdToken()
      if (!idToken) {
        throw new Error('Unexpected Error when getting firebase Id token.')
      }
      const accessToken = await getAccessToken(idToken)
      await loginPageOnAuthStateChangeAction(user, false, accessToken)
      redirect()
    } catch (error) {
      if (
        error instanceof FirebaseError &&
        error.code === FirebaseAuthError.WRONG_PASSWORD
      ) {
        setPasswordInputState(InputState.Invalid)
      } else {
        void errorHandler(normalizeError(error), { userEmail: email })
        dispatch(loginActions.changeState(FormState.LoginFail))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <FormTitle>輸入密碼</FormTitle>
      <GenericPasswordInput
        value={password}
        placeholder="密碼大於 6 位數"
        invalidMessage="密碼錯誤，請重新再試"
        state={passwordInputState}
        onChange={handlePasswordOnChange}
      />
      <div className="my-6 flex flex-col gap-3">
        <PrimaryButton
          isLoading={isLoading}
          disabled={!allowToSubmit}
          onClick={handleSubmit}
        >
          登入會員
        </PrimaryButton>
        <DefaultButton onClick={handleBack}>回上一步</DefaultButton>
      </div>
      <TextButton href={{ pathname: '/recover-password', query: { email } }}>
        忘記密碼？
      </TextButton>
    </>
  )
}
