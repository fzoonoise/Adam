const Start = 'start'
const Incomplete = 'incomplete'
const Invalid = 'invalid'
const Valid = 'valid'

type InputStateEnum =
  | typeof Start
  | typeof Incomplete
  | typeof Invalid
  | typeof Valid

export const InputState = {
  Start,
  Incomplete,
  Invalid,
  Valid,
} as const

export type { InputStateEnum }
