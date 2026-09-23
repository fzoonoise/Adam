import type { ComponentPropsWithoutRef } from 'react'

import { cn } from '@/components/cn'

import { InputState, type InputStateEnum } from '../authentication-form'

type HintProps = ComponentPropsWithoutRef<'p'> & {
  state: InputStateEnum
}

const colorByState: Record<InputStateEnum, string> = {
  [InputState.Start]: 'text-mm-neutral-500',
  [InputState.Incomplete]: 'text-mm-neutral-500',
  [InputState.Invalid]: 'text-mm-error-500',
  [InputState.Valid]: 'text-mm-second-700',
}

export default function Hint({
  state,
  className,
  children,
  ...props
}: HintProps) {
  return (
    <p
      className={cn(
        'flex items-center gap-1 font-mm-sans text-mm-body2',
        colorByState[state],
        className
      )}
      {...props}
    >
      {children}
    </p>
  )
}

export type { HintProps }
