import { type ChangeEventHandler, useState } from 'react'

import { useAppDispatch, useAppSelector } from '@/hooks/useRedux'
import { isValidEmail } from '@/utils'

import { InputState, type InputStateEnum } from '../authentication-form'
import { loginActions, loginEmail } from '../authentication-state'

import GenericTextInput from './text-input'

const getValidity = (email: string): InputStateEnum => {
  if (email === '') return InputState.Start
  return isValidEmail(email) ? InputState.Valid : InputState.Incomplete
}

export default function RegistrationEmailInput() {
  const dispatch = useAppDispatch()
  const email = useAppSelector(loginEmail)
  const [state, setState] = useState<InputStateEnum>(getValidity(email))

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const inputValue = event.target.value
    setState(getValidity(inputValue))
    dispatch(loginActions.setEmail(inputValue))
  }

  return (
    <GenericTextInput
      placeholder="name@example.com"
      incompleteMessage="Email 格式正確"
      validMessage="Email 格式正確"
      value={email}
      state={state}
      onChange={handleInputChange}
    />
  )
}
