import { useEffect } from 'react'
import { useRouter } from 'next/router'

import FormWrapper from '@/components/common/form-wrapper'
import { Typography } from '@/components/ui/typography'
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
      <Typography
        as="p"
        className="leading-normal font-medium text-mm-neutral-800"
        variant="h3"
      >
        變更密碼成功！
        <br />
        請重新登入
      </Typography>
      <Typography
        className="mt-8 leading-normal text-mm-neutral-400"
        variant="body-l"
      >
        將於 {REDIRECTION_DELAY} 秒後自動跳轉至會員登入...
      </Typography>
    </FormWrapper>
  )
}
