import { useEffect } from 'react'

import FormWrapper from '@/components/common/form-wrapper'
import { Typography } from '@/components/ui/typography'
import { SECOND } from '@/constants/time-unit'

import useRedirect from '../use-authentication-redirect'

const REDIRECTION_DELAY = 5

export default function RegistrationSuccess() {
  const { redirect } = useRedirect()

  useEffect(() => {
    const task = setTimeout(() => redirect(), SECOND * REDIRECTION_DELAY)
    return () => clearTimeout(task)
  }, [redirect])

  return (
    <main className="flex flex-col items-center">
      <FormWrapper>
        <Typography
          as="p"
          className="leading-normal font-medium text-mm-neutral-800"
          variant="h3"
        >
          註冊成功！
          <br />
          歡迎加入鏡週刊
        </Typography>
        <Typography
          className="mt-8 leading-normal text-mm-neutral-400"
          variant="body-l"
        >
          將於 {REDIRECTION_DELAY} 秒後自動跳轉至首頁...
        </Typography>
      </FormWrapper>
    </main>
  )
}
