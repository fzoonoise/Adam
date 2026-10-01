import type { MouseEventHandler, ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

type PrimaryButtonProps = {
  children: ReactNode // 按鈕顯示內容
  disabled?: boolean // 是否禁止點擊
  isLoading?: boolean // 是否顯示載入效果
  onClick: MouseEventHandler<HTMLButtonElement> // 按鈕點擊事件處理
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
