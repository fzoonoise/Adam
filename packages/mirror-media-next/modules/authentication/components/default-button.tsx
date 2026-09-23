import type { MouseEventHandler, ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

type DefaultButtonProps = {
  children: ReactNode
  isLoading?: boolean
  onClick: MouseEventHandler<HTMLButtonElement>
}

export default function DefaultButton({
  children,
  isLoading = false,
  onClick,
}: DefaultButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      isLoading={isLoading}
      onClick={onClick}
    >
      {isLoading ? (
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
