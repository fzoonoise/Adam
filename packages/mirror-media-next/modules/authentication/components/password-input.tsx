import { type ChangeEventHandler, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import IconConceal from '@/public/images-next/login/conceal.svg'
import IconReveal from '@/public/images-next/login/reveal.svg'

import { InputState, type InputStateEnum } from '../authentication-form'

import getHint from './get-input-hint'

type GenericPasswordInputProps = {
  id?: string
  value: string // 輸入值
  state: InputStateEnum // 輸入狀態
  placeholder: string // 輸入框佔位文字
  incompleteMessage?: string // 輸入未完成的提示
  invalidMessage?: string // 輸入錯誤的提示
  validMessage?: string // 輸入正確的提示
  onChange: ChangeEventHandler<HTMLInputElement> // 輸入值變動處理
}

export default function GenericPasswordInput({
  id,
  value,
  state,
  placeholder,
  incompleteMessage,
  invalidMessage,
  validMessage,
  onChange,
}: GenericPasswordInputProps) {
  const [isConcealed, setIsConcealed] = useState(true)

  return (
    <div className="flex w-full flex-col gap-2 bg-white">
      <div className="relative">
        <Input
          id={id}
          type={isConcealed ? 'password' : 'text'}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          hasError={state === InputState.Invalid}
          className="pr-10"
        />
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label={isConcealed ? '顯示密碼' : '隱藏密碼'}
          aria-pressed={!isConcealed}
          className="absolute top-1/2 right-1 -translate-y-1/2 rounded-mm-xs active:not-aria-[haspopup]:-translate-y-1/2"
          onClick={() => setIsConcealed((current) => !current)}
        >
          {isConcealed ? (
            <IconReveal className="size-6" />
          ) : (
            <IconConceal className="size-6" />
          )}
        </Button>
      </div>
      {getHint(state, {
        incompleteMessage,
        invalidMessage,
        validMessage,
      })}
    </div>
  )
}
