import type { ChangeEventHandler } from 'react'

import { useAppDispatch, useAppSelector } from '@/hooks/useRedux'

import { loginActions, loginPassword } from '../authentication-state'
import {
  getNewPasswordHint,
  getNewPasswordInputState,
} from '../password-policy'

import GenericPasswordInput from './password-input'

export default function RegistrationPasswordInput() {
  const dispatch = useAppDispatch()
  const password = useAppSelector(loginPassword)
  const state = getNewPasswordInputState(password)

  const handleOnChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    dispatch(loginActions.setPassword(event.target.value))
  }

  return (
    <GenericPasswordInput
      value={password}
      placeholder="密碼至少需 8 個字元"
      state={state}
      invalidMessage={getNewPasswordHint(password)}
      reservedHintMessage={getNewPasswordHint('')}
      onChange={handleOnChange}
    />
  )
}
