import { useEffect } from 'react'

import FormWrapper from '@/components/common/form-wrapper'
import { Typography } from '@/components/ui/typography'
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
        <Typography
          as="p"
          className="leading-normal font-medium text-mm-neutral-800 not-italic"
          variant="h3"
        >
          儲存成功
        </Typography>
        <Typography
          className="mt-4 leading-normal text-mm-neutral-500 not-italic"
          variant="body-l"
        >
          將於 {REDIRECTION_DELAY} 秒後導回個人資料頁...
        </Typography>
      </FormWrapper>
    </main>
  )
}
