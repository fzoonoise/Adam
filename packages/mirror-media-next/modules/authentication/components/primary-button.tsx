import type { MouseEventHandler, ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

type PrimaryButtonProps = {
  children: ReactNode
  disabled?: boolean
  isLoading?: boolean
  onClick: MouseEventHandler<HTMLButtonElement>
}

export default function PrimaryButton({
  children,
  isLoading = false,
  disabled = false,
  onClick,
}: PrimaryButtonProps) {
  return (
    <Button
      type="button"
      className="w-full"
      disabled={disabled}
      isLoading={isLoading && !disabled}
      onClick={onClick}
    >
      {isLoading && !disabled ? (
        <>
          <Spinner aria-hidden="true" role="presentation" />
          <span>載入中</span>
        </>
      ) : (
        children
      )}
    </Button>
  )
}
