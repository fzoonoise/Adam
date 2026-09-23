import { type ChangeEventHandler, useState } from 'react'

import { Input } from '@/components/ui/input'
import IconConceal from '@/public/images-next/login/conceal.svg'
import IconReveal from '@/public/images-next/login/reveal.svg'

import { InputState, type InputStateEnum } from '../authentication-form'

import getHint from './get-input-hint'

type GenericPasswordInputProps = {
  id?: string
  value: string
  state: InputStateEnum
  placeholder: string
  incompleteMessage?: string
  invalidMessage?: string
  validMessage?: string
  onChange: ChangeEventHandler<HTMLInputElement>
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
        <button
          type="button"
          aria-label={isConcealed ? '顯示密碼' : '隱藏密碼'}
          aria-pressed={!isConcealed}
          className="absolute top-1/2 right-1 flex size-8 -translate-y-1/2 items-center justify-center rounded-mm-xs outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mm-all-black focus-visible:outline-solid"
          onClick={() => setIsConcealed((current) => !current)}
        >
          {isConcealed ? (
            <IconReveal className="size-6" />
          ) : (
            <IconConceal className="size-6" />
          )}
        </button>
      </div>
      {getHint(state, {
        incompleteMessage,
        invalidMessage,
        validMessage,
      })}
    </div>
  )
}
