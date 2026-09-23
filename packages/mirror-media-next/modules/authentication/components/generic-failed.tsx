import type { MouseEventHandler } from 'react'

import FormWrapper from '@/components/common/form-wrapper'

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
        <p className="font-mm-sans text-2xl leading-normal font-medium text-mm-neutral-800">
          抱歉，出了點狀況...
          <br />
          {primaryText}
        </p>
        <p className="my-4 mb-8 font-mm-sans text-lg leading-normal text-mm-neutral-500">
          或是聯繫客服信箱{' '}
          <StyledLink href="mailto:mm-onlineservice@mirrormedia.mg">
            mm-onlineservice@mirrormedia.mg
          </StyledLink>{' '}
          / 致電 (02)6633-3966 由專人為您服務。
        </p>
        <DefaultButton onClick={onBack}>回上一步</DefaultButton>
      </FormWrapper>
    </main>
  )
}
