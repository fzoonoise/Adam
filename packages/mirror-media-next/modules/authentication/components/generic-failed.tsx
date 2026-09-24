import type { MouseEventHandler } from 'react'

import FormWrapper from '@/components/common/form-wrapper'
import { Typography } from '@/components/ui/typography'

import DefaultButton from './default-button'
import StyledLink from './styled-link'

type GenericFailedProps = {
  primaryText: string
  onBack: MouseEventHandler<HTMLButtonElement>
}

export default function GenericFailed({
  primaryText,
  onBack,
}: GenericFailedProps) {
  return (
    <main className="flex flex-col items-center">
      <FormWrapper>
        <Typography
          as="p"
          className="leading-normal font-medium text-mm-neutral-800"
          variant="h3"
        >
          抱歉，出了點狀況...
          <br />
          {primaryText}
        </Typography>
        <Typography
          className="my-4 mb-8 leading-normal text-mm-neutral-500"
          variant="body-l"
        >
          或是聯繫客服信箱{' '}
          <StyledLink href="mailto:mm-onlineservice@mirrormedia.mg">
            mm-onlineservice@mirrormedia.mg
          </StyledLink>{' '}
          / 致電 (02)6633-3966 由專人為您服務。
        </Typography>
        <DefaultButton onClick={onBack}>回上一步</DefaultButton>
      </FormWrapper>
    </main>
  )
}
