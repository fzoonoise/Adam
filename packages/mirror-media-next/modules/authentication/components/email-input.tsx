import { type ChangeEventHandler, useState } from 'react'

import { useAppDispatch, useAppSelector } from '@/hooks/useRedux'
import { isValidEmail } from '@/utils'

import { InputState, type InputStateEnum } from '../authentication-form'
import { loginActions, loginEmail } from '../authentication-state'

import GenericTextInput from './text-input'

type EmailInputProps = {
  shouldShowHint?: boolean // 是否顯示輸入提示訊息
}

const getValidity = (email: string): InputStateEnum => {
  if (email === '') return InputState.Start
  return isValidEmail(email) ? InputState.Valid : InputState.Invalid
}

export default function EmailInput({ shouldShowHint = true }: EmailInputProps) {
  const dispatch = useAppDispatch()
  const email = useAppSelector(loginEmail)
  const [state, setState] = useState<InputStateEnum>(getValidity(email))

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const inputValue = event.target.value
    if (shouldShowHint) setState(getValidity(inputValue))
    dispatch(loginActions.setEmail(inputValue))
  }

  return (
    <GenericTextInput
      placeholder="name@example.com"
      invalidMessage={shouldShowHint ? '請輸入有效的 Email 地址' : ''}
      validMessage={shouldShowHint ? 'Email 格式正確' : ''}
      value={email}
      state={state}
      onChange={handleInputChange}
    />
  )
}
