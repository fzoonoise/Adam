import {
  type MouseEventHandler,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useRouter } from 'next/router'
import { FirebaseError } from 'firebase/app'
import { applyActionCode } from 'firebase/auth'

import FormWrapper from '@/components/common/form-wrapper'
import { Typography } from '@/components/ui/typography'
import { FirebaseAuthError } from '@/constants/firebase'
import { auth } from '@/firebase'
import { useMembership } from '@/modules/membership/membership-context'
import { getSearchParamFromApiKeyUrl } from '@/utils'
import { generateErrorReportInfo } from '@/utils/log/error-log'
import { sendErrorLog } from '@/utils/log/send-log'
import { normalizeError } from '@/utils/normalize-error'

import PrimaryButton from './primary-button'
import StyledLink from './styled-link'

const DEFAULT = 'default'
const SUCCESS = 'success'
const FAILED = 'failed'

const VERIFICATION_STATE = {
  DEFAULT,
  SUCCESS,
  FAILED,
} as const

type VerificationState =
  (typeof VERIFICATION_STATE)[keyof typeof VERIFICATION_STATE]

const VALID_STATES: VerificationState[] = [
  VERIFICATION_STATE.DEFAULT,
  VERIFICATION_STATE.SUCCESS,
]

export default function BodyEmailVerification() {
  const isProcessing = useRef(false)
  const { isLoggedIn, userEmail, firebaseId, memberInfo } = useMembership()
  const [errorType, setErrorType] = useState('')
  const router = useRouter()
  const actionCode = getSearchParamFromApiKeyUrl(router.query, 'oobCode')
  const [verificationState, setVerificationState] = useState<VerificationState>(
    typeof actionCode === 'string'
      ? VERIFICATION_STATE.DEFAULT
      : VERIFICATION_STATE.FAILED
  )

  useEffect(() => {
    if (typeof actionCode !== 'string' || isProcessing.current) return

    isProcessing.current = true

    applyActionCode(auth, actionCode)
      .then(() => {
        setVerificationState(VERIFICATION_STATE.SUCCESS)
      })
      .catch((error: unknown) => {
        setVerificationState(VERIFICATION_STATE.FAILED)

        if (error instanceof FirebaseError) setErrorType(error.code)

        const errorReport = generateErrorReportInfo(normalizeError(error), {
          userEmail,
          firebaseId,
          memberType: memberInfo?.memberType,
        })

        sendErrorLog(errorReport)
      })
  }, [actionCode, userEmail, firebaseId, memberInfo])

  const getFailedContent = () => {
    const secondaryBlock = (
      <Typography
        className="mt-4 leading-normal text-mm-neutral-500"
        variant="body-l"
      >
        或是聯繫客服信箱{' '}
        <StyledLink href="mailto:mm-onlineservice@mirrormedia.mg">
          mm-onlineservice@mirrormedia.mg
        </StyledLink>{' '}
        / 致電 (02)6633-3966 由專人為您服務。
      </Typography>
    )

    let primaryTextWording: ReactNode
    let primaryButtonWording: string
    let onClick: MouseEventHandler<HTMLButtonElement>

    switch (errorType) {
      case FirebaseAuthError.USER_DISABLED:
      case FirebaseAuthError.USER_NOT_FOUND:
        primaryTextWording = (
          <>
            使用者不存在或帳號已停用
            <br />
            請重新註冊／登入帳號
          </>
        )
        primaryButtonWording = '前往註冊會員'
        onClick = () => {
          void router.push({ pathname: '/login' })
        }
        break
      case FirebaseAuthError.EXPIRED_ACTION_CODE:
        primaryTextWording = '連結已過期，請重新驗證'
        primaryButtonWording = '重新驗證信箱'
        onClick = () => {
          void router.push({ pathname: '/email-verify' })
        }
        break
      case FirebaseAuthError.INVALID_ACTION_CODE:
      default:
        primaryTextWording = '連結無效，請重新驗證'
        primaryButtonWording = '重新驗證信箱'
        onClick = () => {
          void router.push({ pathname: '/email-verify' })
        }
        break
    }

    return (
      <>
        <div className="mb-8">
          <Typography
            as="p"
            className="leading-normal font-medium break-all text-mm-neutral-800"
            variant="h3"
          >
            {primaryTextWording}
          </Typography>
          {secondaryBlock}
        </div>
        <PrimaryButton onClick={onClick}>{primaryButtonWording}</PrimaryButton>
      </>
    )
  }

  const getContent = () => {
    if (verificationState !== VERIFICATION_STATE.SUCCESS) return null

    const primaryTextWording = isLoggedIn
      ? `${userEmail} 已驗證成功！`
      : '已驗證成功！'
    const primaryButtonWording = isLoggedIn ? '繼續前往付款' : '重新登入'

    const onClick: MouseEventHandler<HTMLButtonElement> = () => {
      const destination = '/subscribe'

      if (isLoggedIn) {
        window.location.href = destination
        /**
         * TODO: 等待會員訂購頁完成後，改用 router 來處理跳轉
         *
        router.push({
          pathname: destination,
        })
        */
      } else {
        void router.push({
          pathname: '/login',
          query: { destination },
        })
      }
    }

    return (
      <>
        <div className="mb-6">
          <Typography
            as="p"
            className="leading-normal font-medium break-all text-mm-neutral-800"
            variant="h3"
          >
            {primaryTextWording}
          </Typography>
          {!isLoggedIn && (
            <Typography
              className="mt-3 leading-normal text-mm-neutral-500"
              variant="body-l"
            >
              請重新登入，繼續完成訂購流程
            </Typography>
          )}
        </div>
        <PrimaryButton onClick={onClick}>{primaryButtonWording}</PrimaryButton>
      </>
    )
  }

  return (
    <main className="flex flex-col items-center">
      {VALID_STATES.includes(verificationState) ? (
        <FormWrapper className="md:w-117">{getContent()}</FormWrapper>
      ) : (
        <FormWrapper>{getFailedContent()}</FormWrapper>
      )}
    </main>
  )
}
