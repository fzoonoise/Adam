import type { ChangeEventHandler } from 'react'

import GenericPasswordInput from '../../components/shared/inputs/generic-password-input'

import { getPasswordConfirmationInputState } from './password-policy'

type PasswordConfirmationInputProps = {
  password: string
  value: string
  onChange: ChangeEventHandler<HTMLInputElement>
  placeholder?: string
}

export default function PasswordConfirmationInput({
  password,
  value,
  onChange,
  placeholder = '確認密碼',
}: PasswordConfirmationInputProps) {
  return (
    <GenericPasswordInput
      value={value}
      state={getPasswordConfirmationInputState(password, value)}
      placeholder={placeholder}
      invalidMessage="兩次密碼須相符"
      validMessage="兩次密碼相符"
      onChange={onChange}
    />
  )
}
