import type { ReactNode } from 'react'

import IconCheckPass from '@/public/images-next/check-pass.svg'

import { InputState, type InputStateEnum } from '../authentication-form'

import Hint from './input-hint'

type HintMessages = {
  incompleteMessage?: string
  invalidMessage?: string
  validMessage?: string
}

export default function getHint(
  state: InputStateEnum,
  { incompleteMessage, invalidMessage, validMessage }: HintMessages
): ReactNode {
  switch (state) {
    case InputState.Invalid:
      return invalidMessage ? (
        <Hint state={InputState.Invalid}>{invalidMessage}</Hint>
      ) : null
    case InputState.Valid:
      return validMessage ? (
        <Hint state={InputState.Valid}>
          <IconCheckPass className="size-4" />
          <span>{validMessage}</span>
        </Hint>
      ) : null
    case InputState.Incomplete:
      return incompleteMessage ? (
        <Hint state={InputState.Incomplete}>{incompleteMessage}</Hint>
      ) : null
    case InputState.Start:
      return null
    default: {
      const unhandledState: never = state
      throw new Error(`Unexpected input state: ${String(unhandledState)}`)
    }
  }
}
