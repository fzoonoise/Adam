import { type ChangeEventHandler, useState } from 'react'

import { useAppDispatch, useAppSelector } from '@/hooks/useRedux'
import { isValidPassword } from '@/utils'

import { InputState, type InputStateEnum } from '../authentication-form'
import { loginActions, loginPassword } from '../authentication-state'

import GenericPasswordInput from './password-input'

const getValidity = (password: string): InputStateEnum => {
  if (password === '') return InputState.Start
  return isValidPassword(password) ? InputState.Valid : InputState.Incomplete
}

export default function RegistrationPasswordInput() {
  const dispatch = useAppDispatch()
  const password = useAppSelector(loginPassword)
  const [state, setState] = useState<InputStateEnum>(getValidity(password))

  const handleOnChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const inputValue = event.target.value
    setState(getValidity(inputValue))
    dispatch(loginActions.setPassword(inputValue))
  }

  return (
    <GenericPasswordInput
      value={password}
      placeholder="密碼須在 6 位數以上"
      validMessage="密碼在 6 位數以上"
      incompleteMessage="密碼在 6 位數以上"
      state={state}
      onChange={handleOnChange}
    />
  )
}
