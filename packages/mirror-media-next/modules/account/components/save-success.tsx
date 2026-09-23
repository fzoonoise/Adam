import { useEffect } from 'react'

import FormWrapper from '@/components/common/form-wrapper'
import { SECOND } from '@/constants/time-unit'

const REDIRECTION_DELAY = 5

type SaveSuccessProps = {
  onReset: () => void
}

export default function SaveSuccess({ onReset }: SaveSuccessProps) {
  useEffect(() => {
    const task = setTimeout(() => onReset(), SECOND * REDIRECTION_DELAY)

    return () => {
      clearTimeout(task)
    }
  }, [onReset])

  return (
    <main className="flex flex-col items-center">
      <FormWrapper variant="compact">
        <p className="text-2xl leading-normal font-medium text-mm-neutral-800 not-italic">
          儲存成功
        </p>
        <p className="mt-4 text-lg leading-normal font-normal text-mm-neutral-500 not-italic">
          將於 {REDIRECTION_DELAY} 秒後導回個人資料頁...
        </p>
      </FormWrapper>
    </main>
  )
}
