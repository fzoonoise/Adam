import type { MouseEventHandler, ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

type DefaultButtonProps = {
  children: ReactNode // 按鈕顯示內容
  isLoading?: boolean // 是否顯示載入效果
  onClick: MouseEventHandler<HTMLButtonElement> // 按鈕點擊事件處理
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
