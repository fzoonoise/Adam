import type { ComponentPropsWithoutRef } from 'react'

import StyledLink from './styled-link'

type TextButtonProps = ComponentPropsWithoutRef<typeof StyledLink>

export default function TextButton({ className, ...props }: TextButtonProps) {
  return (
    <div className="flex flex-col items-center">
      <StyledLink
        className={`inline-block font-mm-sans text-mm-body2 ${className ?? ''}`}
        {...props}
      />
    </div>
  )
}
