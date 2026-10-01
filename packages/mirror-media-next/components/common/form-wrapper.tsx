import type { ComponentPropsWithoutRef } from 'react'

import { cn } from '@/components/cn'

type FormWrapperProps = ComponentPropsWithoutRef<'div'> & {
  variant?: 'default' | 'compact'
}

const paddingByVariant: Record<
  NonNullable<FormWrapperProps['variant']>,
  string
> = {
  default: 'py-10',
  compact: 'py-6 md:py-10',
}

export default function FormWrapper({
  variant = 'default',
  className,
  ...props
}: FormWrapperProps) {
  return (
    <div
      className={cn(
        // prevent content from exceeding the boundaries of header
        'w-full max-w-149 min-w-80 bg-white px-5 md:my-12 md:w-106 md:rounded-3xl md:border md:border-mm-neutral-200 md:px-10 md:shadow-lg',
        paddingByVariant[variant],
        className
      )}
      {...props}
    />
  )
}

export type { FormWrapperProps }
