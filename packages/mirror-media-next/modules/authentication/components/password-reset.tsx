import { type ChangeEventHandler, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth'

import FormWrapper from '@/components/common/form-wrapper'
import { Typography } from '@/components/ui/typography'
import { auth } from '@/firebase'
import { getSearchParamFromApiKeyUrl, isValidPassword } from '@/utils'
import { generateErrorReportInfo } from '@/utils/log/error-log'
import { sendErrorLog } from '@/utils/log/send-log'
import { normalizeError } from '@/utils/normalize-error'

import { InputState } from '../authentication-form'

import GenericPasswordInput from './password-input'
import PrimaryButton from './primary-button'

const getValidity = (password: string) => {
  if (password === '') return InputState.Start
  return isValidPassword(password) ? InputState.Valid : InputState.Invalid
}

export default function BodyPasswordReset() {
  const [password, setPassword] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()
  const actionCode = getSearchParamFromApiKeyUrl(router.query, 'oobCode')
  const email = useRef('')
  const validity = getValidity(password)

  const handleOnInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setPassword(event.target.value)
  }

  const handleOnPrimaryButtonClicked = async () => {
    if (isProcessing) return

    setIsProcessing(true)

    try {
      if (typeof actionCode !== 'string') {
        throw new Error('Invalid action code')
      }

      await confirmPasswordReset(auth, actionCode, password)
      void router.replace('/password-change-success')
    } catch (error) {
      const errorReport = generateErrorReportInfo(normalizeError(error), {
        userEmail: email.current,
      })
      sendErrorLog(errorReport)

      void router.replace({
        pathname: '/password-change-fail',
        query: { from: router.pathname },
      })
    } finally {
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    if (isInitialized) return

    const checkUrlInfo = async () => {
      try {
        if (typeof actionCode !== 'string') {
          throw new Error('Invalid action code')
        }

        email.current = await verifyPasswordResetCode(auth, actionCode)
        setIsInitialized(true)
      } catch (error) {
        const errorReport = generateErrorReportInfo(normalizeError(error), {
          userEmail: email.current,
        })
        sendErrorLog(errorReport)

        void router.replace({
          pathname: '/password-change-fail',
          query: { from: router.pathname },
        })
      }
    }

    void checkUrlInfo()
  }, [actionCode, isInitialized, router])

  return (
    <main className="flex flex-col items-center">
      <FormWrapper>
        {isInitialized ? (
          <>
            <div className="mb-6 flex flex-col gap-4">
              <Typography
                as="p"
                className="leading-normal font-medium text-mm-neutral-800"
                variant="h3"
              >
                請輸入新的密碼
              </Typography>
              <GenericPasswordInput
                placeholder="密碼大於 6 位數"
                state={validity}
                value={password}
                onChange={handleOnInputChange}
              />
            </div>
            <PrimaryButton
              onClick={handleOnPrimaryButtonClicked}
              isLoading={isProcessing}
              disabled={validity !== InputState.Valid}
            >
              送出
            </PrimaryButton>
          </>
        ) : null}
        {/* TODO: add loading effect (should discuss with designer and PM) */}
      </FormWrapper>
    </main>
  )
}
