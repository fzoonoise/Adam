import type { ComponentPropsWithoutRef } from 'react'

import { cn } from '@/components/cn'

type FormTitleProps = ComponentPropsWithoutRef<'p'>

export default function FormTitle({ className, ...props }: FormTitleProps) {
  return (
    <p
      className={cn(
        'mb-4 font-mm-sans text-2xl leading-normal font-medium text-mm-neutral-800',
        className
      )}
      {...props}
    />
  )
}
