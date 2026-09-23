import type { ReactNode } from 'react'

import type { InputStateEnum } from '../authentication-form'

import Hint from './input-hint'

type CenteredHintProps = {
  state: InputStateEnum
  children: ReactNode
}

export default function CenteredHint({ state, children }: CenteredHintProps) {
  return (
    <Hint state={state} className="self-center text-center">
      {children}
    </Hint>
  )
}
