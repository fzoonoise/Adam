import { InputState } from '../authentication-form'

import CenteredHint from './centered-input-hint'
import Hint from './input-hint'

const DEFAULT = 'default'
const NOT_REGISTERED = 'not-registered'
const ERROR = 'error'
const IN_PROGRESS = 'in-progress'
const SUCCESS = 'success'

export const HINT_STATE = {
  DEFAULT,
  NOT_REGISTERED,
  ERROR,
  IN_PROGRESS,
  SUCCESS,
} as const

type HintState = (typeof HINT_STATE)[keyof typeof HINT_STATE]

type HintsProps = {
  state: HintState
}

export default function Hints({ state }: HintsProps) {
  switch (state) {
    case IN_PROGRESS:
      return (
        <Hint
          state={InputState.Incomplete}
          className="self-center text-center text-base"
        >
          正在寄出信件...
        </Hint>
      )
    case NOT_REGISTERED:
      return (
        <Hint
          state={InputState.Invalid}
          className="self-center text-center text-base"
        >
          這個 Email 尚未註冊
        </Hint>
      )
    case ERROR:
      return (
        <Hint
          state={InputState.Invalid}
          className="self-center text-center text-base"
        >
          Email 寄出失敗，請重新再試
        </Hint>
      )
    case SUCCESS:
      return (
        <>
          <Hint
            state={InputState.Valid}
            className="self-center text-center text-base"
          >
            Email 已成功寄出
          </Hint>
          <CenteredHint state={InputState.Incomplete}>
            沒收到信嗎？請檢查垃圾信件匣，或等候 30 秒重新寄送
          </CenteredHint>
        </>
      )
    case DEFAULT:
      return null
    default: {
      const unhandledState: never = state
      throw new Error(
        `Unexpected password recovery hint state: ${String(unhandledState)}`
      )
    }
  }
}

export type { HintState }
