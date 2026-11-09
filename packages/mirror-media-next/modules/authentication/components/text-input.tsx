import type { ChangeEventHandler } from 'react'

import { Input } from '@/components/ui/input'

import { InputState, type InputStateEnum } from '../authentication-form'

import getHint from './get-input-hint'

type GenericTextInputProps = {
  value?: string // 輸入值
  state: InputStateEnum // 輸入狀態
  placeholder: string // 輸入框佔位文字
  isDisabled?: boolean // 是否禁止修改
  incompleteMessage?: string // 輸入未完成的提示
  invalidMessage?: string // 輸入錯誤的提示
  validMessage?: string // 輸入正確的提示
  onChange: ChangeEventHandler<HTMLInputElement> // 輸入值變動處理
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
    <div className="flex w-full flex-col">
      <Input
        type="text"
        value={value}
        placeholder={placeholder}
        disabled={isDisabled}
        onChange={onChange}
        hasError={state === InputState.Invalid}
      />
      <div className="flex min-h-10 items-center py-2">
        {getHint(state, {
          incompleteMessage,
          invalidMessage,
          validMessage,
        })}
      </div>
    </div>
  )
}
