import { type ChangeEventHandler, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth'

import FormWrapper from '@/components/common/form-wrapper'
import { Typography } from '@/components/ui/typography'
import { auth } from '@/firebase'
import { getSearchParamFromApiKeyUrl } from '@/utils'
import { generateErrorReportInfo } from '@/utils/log/error-log'
import { sendErrorLog } from '@/utils/log/send-log'
import { normalizeError } from '@/utils/normalize-error'

import { InputState } from '../authentication-form'
import {
  getNewPasswordHint,
  getNewPasswordInputState,
  isValidNewPassword,
} from '../password-policy'

import GenericPasswordInput from './password-input'
import PrimaryButton from './primary-button'

export default function BodyPasswordReset() {
  const [password, setPassword] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const isSubmitting = useRef(false)
  const router = useRouter()
  const actionCode = getSearchParamFromApiKeyUrl(router.query, 'oobCode')
  const email = useRef('')
  const validity = getNewPasswordInputState(password)

  const handleOnInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setPassword(event.target.value)
  }

  const handleOnPrimaryButtonClicked = async () => {
    if (!isInitialized || !isValidNewPassword(password) || isSubmitting.current)
      return
    isSubmitting.current = true
    setIsProcessing(true)

    try {
      try {
        if (typeof actionCode !== 'string')
          throw new Error('Invalid action code')
        await confirmPasswordReset(auth, actionCode, password)
      } catch (error) {
        const errorReport = generateErrorReportInfo(normalizeError(error), {
          userEmail: email.current,
        })
        sendErrorLog(errorReport)
        await router.replace({
          pathname: '/password-change-fail',
          query: { from: router.pathname },
        })
        return
      }
      await router.replace('/password-change-success')
    } finally {
      isSubmitting.current = false
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
            <div className="flex flex-col gap-4">
              <Typography
                as="p"
                className="leading-normal font-medium text-mm-neutral-800"
                variant="h3"
              >
                請輸入新的密碼
              </Typography>
              <GenericPasswordInput
                placeholder="密碼至少需 8 個字元"
                invalidMessage={getNewPasswordHint(password)}
                reservedHintMessage={getNewPasswordHint('')}
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
