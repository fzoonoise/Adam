import type { ComponentPropsWithoutRef } from 'react'
import NextLink from 'next/link'

import { cn } from '@/components/cn'

type StyledLinkProps = ComponentPropsWithoutRef<typeof NextLink>

export default function StyledLink({ className, ...props }: StyledLinkProps) {
  return (
    <NextLink
      className={cn(
        'text-mm-second-500 underline-offset-4 outline-none hover:text-mm-second-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mm-all-black focus-visible:outline-solid',
        className
      )}
      {...props}
    />
  )
}
