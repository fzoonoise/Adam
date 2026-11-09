import type { ChangeEventHandler } from 'react'

import { useAppDispatch, useAppSelector } from '@/hooks/useRedux'
import { isCompanyEmail, isValidEmail } from '@/utils'

import { InputState } from '../authentication-form'
import { loginActions, loginEmail } from '../authentication-state'

import GenericTextInput from './text-input'

type EmailInputProps = {
  shouldShowHint?: boolean // 是否顯示輸入提示訊息
}

export default function EmailInput({ shouldShowHint = true }: EmailInputProps) {
  const dispatch = useAppDispatch()
  const email = useAppSelector(loginEmail)
  const hasValidFormat = isValidEmail(email)
  const shouldUseGoogle = hasValidFormat && isCompanyEmail(email)
  const invalidMessage = shouldShowHint
    ? shouldUseGoogle
      ? '若您想以本公司企業信箱登入，請點擊上方「以 Google 帳號繼續」重試，以享有 Premium 會員資格。'
      : '請輸入有效的 Email 地址'
    : ''
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
      validMessage={shouldShowHint ? 'Email 格式正確' : ''}
      value={email}
      state={state}
      onChange={handleInputChange}
    />
  )
}
