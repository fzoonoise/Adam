import type { ChangeEventHandler } from 'react'

import { Input } from '@/components/ui/input'

import { InputState, type InputStateEnum } from '../authentication-form'

import getHint from './get-input-hint'

type GenericTextInputProps = {
  value?: string
  state: InputStateEnum
  placeholder: string
  isDisabled?: boolean
  incompleteMessage?: string
  invalidMessage?: string
  validMessage?: string
  onChange: ChangeEventHandler<HTMLInputElement>
}

export default function GenericTextInput({
  value,
  placeholder,
  state,
  isDisabled = false,
  incompleteMessage,
  invalidMessage,
  validMessage,
  onChange,
}: GenericTextInputProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      <Input
        type="text"
        value={value}
        placeholder={placeholder}
        disabled={isDisabled}
        onChange={onChange}
        hasError={state === InputState.Invalid}
      />
      {getHint(state, {
        incompleteMessage,
        invalidMessage,
        validMessage,
      })}
    </div>
  )
}
