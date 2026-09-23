import { useEffect } from 'react'

import FormWrapper from '@/components/common/form-wrapper'
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
        <p className="font-mm-sans text-2xl leading-normal font-medium text-mm-neutral-800">
          註冊成功！
          <br />
          歡迎加入鏡週刊
        </p>
        <p className="mt-8 font-mm-sans text-lg leading-normal text-mm-neutral-400">
          將於 {REDIRECTION_DELAY} 秒後自動跳轉至首頁...
        </p>
      </FormWrapper>
    </main>
  )
}
