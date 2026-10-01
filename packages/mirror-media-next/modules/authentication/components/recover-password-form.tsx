import { type ChangeEventHandler, useEffect, useState } from 'react'
import { FirebaseError } from 'firebase/app'
import { sendPasswordResetEmail } from 'firebase/auth'

import FormWrapper from '@/components/common/form-wrapper'
import { Typography } from '@/components/ui/typography'
import { ACTION_CODE_SETTING } from '@/config/index.mjs'
import { FirebaseAuthError } from '@/constants/firebase'
import { SECOND } from '@/constants/time-unit'
import { auth } from '@/firebase'
import { isValidEmail } from '@/utils'
import { generateErrorReportInfo } from '@/utils/log/error-log'
import { sendErrorLog } from '@/utils/log/send-log'
import { normalizeError } from '@/utils/normalize-error'
import {
  getStorageItem,
  removeStorageItem,
  setStorageItem,
} from '@/utils/safe-storage'

import { InputState, type InputStateEnum } from '../authentication-form'

import PrimaryButton from './primary-button'
import Hints, { HINT_STATE, type HintState } from './recover-password-hints'
import TextButton from './text-button'
import GenericTextInput from './text-input'

const COOLDOWN_STORAGE_KEY = 'recover-password-cooldown'
const AVOID_SPAM_COOLDOWN = SECOND * 30

type RecoverPasswordFormProps = {
  initialEmail: string
}

const getValidity = (email: string): InputStateEnum => {
  if (email === '') return InputState.Start
  return isValidEmail(email) ? InputState.Valid : InputState.Invalid
}

export default function RecoverPasswordForm({
  initialEmail,
}: RecoverPasswordFormProps) {
  const [email, setEmail] = useState(initialEmail)
  const [inputState, setInputState] = useState<InputStateEnum>(
    getValidity(email)
  )
  const [avoidSpamCooldown, setAvoidSpamCooldown] = useState(0)
  const [hintState, setHintState] = useState<HintState>(HINT_STATE.DEFAULT)

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const inputValue = event.target.value
    setEmail(inputValue)
    setInputState(getValidity(inputValue))
  }

  const handleSubmit = async () => {
    if (
      hintState === HINT_STATE.IN_PROGRESS ||
      inputState !== InputState.Valid
    ) {
      return
    }

    setHintState(HINT_STATE.IN_PROGRESS)

    try {
      await sendPasswordResetEmail(auth, email, {
        ...ACTION_CODE_SETTING,
        url: `${window.location.origin}/login`,
      })

      setHintState(HINT_STATE.SUCCESS)
      setAvoidSpamCooldown(AVOID_SPAM_COOLDOWN)
      const cooldownExpiredTime = Date.now() + AVOID_SPAM_COOLDOWN
      setStorageItem(COOLDOWN_STORAGE_KEY, cooldownExpiredTime.toString())
    } catch (error) {
      if (
        error instanceof FirebaseError &&
        error.code === FirebaseAuthError.USER_NOT_FOUND
      ) {
        setHintState(HINT_STATE.NOT_REGISTERED)
      } else {
        setHintState(HINT_STATE.ERROR)
      }

      const info = generateErrorReportInfo(normalizeError(error), {
        userEmail: email,
      })
      sendErrorLog(info)
    }
  }

  useEffect(() => {
    const cooldownExpiredTime = Number(getStorageItem(COOLDOWN_STORAGE_KEY))
    const now = Date.now()

    if (Number.isNaN(cooldownExpiredTime)) return

    if (cooldownExpiredTime > now) {
      setAvoidSpamCooldown(cooldownExpiredTime - now)
      setHintState(HINT_STATE.SUCCESS)
    } else {
      removeStorageItem(COOLDOWN_STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (avoidSpamCooldown > 0) {
        setAvoidSpamCooldown((state) => state - SECOND)
      } else {
        setHintState(HINT_STATE.DEFAULT)
        clearInterval(timer)
        removeStorageItem(COOLDOWN_STORAGE_KEY)
      }
    }, SECOND)

    return () => clearInterval(timer)
  }, [avoidSpamCooldown])

  return (
    <FormWrapper>
      <div className="flex flex-col gap-4">
        <Typography
          as="p"
          className="leading-normal font-medium text-mm-neutral-800"
          variant="h3"
        >
          如果您忘記/尚未設定密碼
        </Typography>
        <Typography className="text-mm-neutral-400" variant="body2">
          請輸入您註冊時使用的 Email 信箱。我們會發送一封 Email
          到這個地址，裡面附有重設/設定密碼的連結。
        </Typography>
      </div>
      <div className="mt-8 flex flex-col gap-6">
        <GenericTextInput
          placeholder="name@example.com"
          value={email}
          state={inputState}
          onChange={handleInputChange}
        />
        <div className="flex flex-col gap-3">
          <Hints state={hintState} />
          {avoidSpamCooldown > 0 ? (
            <PrimaryButton disabled onClick={() => {}}>
              重新寄送...({Math.floor(avoidSpamCooldown / SECOND)} 秒)
            </PrimaryButton>
          ) : (
            <PrimaryButton
              onClick={handleSubmit}
              isLoading={hintState === HINT_STATE.IN_PROGRESS}
              disabled={inputState !== InputState.Valid}
            >
              送出
            </PrimaryButton>
          )}
        </div>
        <TextButton href="/login">回上一頁</TextButton>
      </div>
    </FormWrapper>
  )
}
