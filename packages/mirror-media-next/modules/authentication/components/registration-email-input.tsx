import type { ChangeEventHandler } from 'react'

import { useAppDispatch, useAppSelector } from '@/hooks/useRedux'
import { isCompanyEmail, isValidEmail } from '@/utils'

import { InputState } from '../authentication-form'
import { loginActions, loginEmail } from '../authentication-state'

import GenericTextInput from './text-input'

export default function RegistrationEmailInput() {
  const dispatch = useAppDispatch()
  const email = useAppSelector(loginEmail)
  const hasValidFormat = isValidEmail(email)
  const shouldUseGoogle = hasValidFormat && isCompanyEmail(email)
  const invalidMessage = shouldUseGoogle
    ? '若您想使用本公司企業信箱，請切換至「登入」，選擇 Google 帳號登入，以享有 Premium 會員資格。'
    : '請輸入有效的 Email 地址'
  const state =
    email === ''
      ? InputState.Start
      : hasValidFormat && !shouldUseGoogle
        ? InputState.Valid
        : InputState.Invalid

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    dispatch(loginActions.setEmail(event.target.value))
  }

  return (
    <GenericTextInput
      placeholder="name@example.com"
      invalidMessage={invalidMessage}
      validMessage="Email 格式正確"
      value={email}
      state={state}
      onChange={handleInputChange}
    />
  )
}
