import { useEffect } from 'react'
import { useRouter } from 'next/router'

import FormWrapper from '@/components/common/form-wrapper'
import { SECOND } from '@/constants/time-unit'
import { logout } from '@/modules/membership/membership-context'

const REDIRECTION_DELAY = 5

export default function PasswordChangeSuccess() {
  const router = useRouter()

  useEffect(() => {
    logout()

    const task = setTimeout(() => {
      void router.push({ pathname: '/login' })
    }, SECOND * REDIRECTION_DELAY)

    return () => clearTimeout(task)
  }, [router])

  return (
    <FormWrapper>
      <p className="font-mm-sans text-2xl leading-normal font-medium text-mm-neutral-800">
        變更密碼成功！
        <br />
        請重新登入
      </p>
      <p className="mt-8 font-mm-sans text-lg leading-normal text-mm-neutral-400">
        將於 {REDIRECTION_DELAY} 秒後自動跳轉至會員登入...
      </p>
    </FormWrapper>
  )
}
