import { useRef, useState } from 'react'
import { useRouter } from 'next/router'
import {
  signInWithEmailAndPassword,
  updatePassword,
  type UserCredential,
} from 'firebase/auth'

import { Label } from '@/components/ui/label'
import { auth } from '@/firebase'
import { generateErrorReportInfo } from '@/utils/log/error-log'
import { sendErrorLog } from '@/utils/log/send-log'
import { normalizeError } from '@/utils/normalize-error'

import { InputState } from '../authentication-form'
import {
  getNewPasswordHint,
  getNewPasswordInputState,
  isValidLoginPassword,
  isValidNewPassword,
} from '../password-policy'

import GenericPasswordInput from './password-input'
import PrimaryButton from './primary-button'

type OldPasswordState = typeof InputState.Start | typeof InputState.Invalid

export default function MainForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const isSubmitting = useRef(false)
  const [oldPassword, setOldPassword] = useState('')
  const [oldPasswordState, setOldPasswordState] = useState<OldPasswordState>(
    InputState.Start
  )
  const [newPassword, setNewPassword] = useState('')
  const newPasswordState = getNewPasswordInputState(newPassword)
  const [newPasswordCheck, setNewPasswordCheck] = useState('')
  const newPasswordCheckState =
    newPasswordCheck === ''
      ? InputState.Start
      : newPassword === newPasswordCheck
        ? InputState.Valid
        : InputState.Invalid
  const allowToSubmit =
    isValidLoginPassword(oldPassword) &&
    isValidNewPassword(newPassword) &&
    newPassword === newPasswordCheck

  const handleOnClickButton = async () => {
    if (!allowToSubmit || isSubmitting.current) return
    isSubmitting.current = true
    setIsLoading(true)

    const email = auth.currentUser?.email
    try {
      let userCredential: UserCredential
      try {
        if (!email) throw new Error('Unable to get current user email')
        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          oldPassword
        )
      } catch (error) {
        const errorReport = generateErrorReportInfo(normalizeError(error), {
          userEmail: email,
        })
        sendErrorLog(errorReport)
        setOldPasswordState(InputState.Invalid)
        return
      }

      try {
        await updatePassword(userCredential.user, newPassword)
      } catch (error) {
        const errorReport = generateErrorReportInfo(normalizeError(error), {
          userEmail: email,
        })
        sendErrorLog(errorReport)
        await router.push({
          pathname: '/password-change-fail',
          query: { from: router.pathname },
        })
        return
      }
      await router.push('/password-change-success')
    } finally {
      isSubmitting.current = false
      setIsLoading(false)
    }
  }

  return (
    <form
      className="mt-4 flex flex-col"
      onSubmit={(event) => {
        event.preventDefault()
        void handleOnClickButton()
      }}
    >
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="current-password"
          className="font-mm-sans text-lg leading-normal text-mm-neutral-800"
        >
          請輸入目前密碼
        </Label>
        <GenericPasswordInput
          id="current-password"
          placeholder="目前密碼"
          invalidMessage="密碼錯誤，請重新再試"
          onChange={(event) => {
            setOldPassword(event.target.value)
            setOldPasswordState(InputState.Start)
          }}
          value={oldPassword}
          state={oldPasswordState}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="new-password"
          className="font-mm-sans text-lg leading-normal text-mm-neutral-800"
        >
          請輸入新密碼
        </Label>
        <GenericPasswordInput
          id="new-password"
          placeholder="密碼至少需 8 個字元"
          invalidMessage={getNewPasswordHint(newPassword)}
          reservedHintMessage={getNewPasswordHint('')}
          onChange={(event) => setNewPassword(event.target.value)}
          value={newPassword}
          state={newPasswordState}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="new-password-check"
          className="font-mm-sans text-lg leading-normal text-mm-neutral-800"
        >
          請再次輸入新密碼
        </Label>
        <GenericPasswordInput
          id="new-password-check"
          placeholder="再次輸入新密碼"
          invalidMessage="兩次密碼須相符"
          validMessage="兩次密碼相符"
          onChange={(event) => setNewPasswordCheck(event.target.value)}
          value={newPasswordCheck}
          state={newPasswordCheckState}
        />
      </div>
      <PrimaryButton
        disabled={!allowToSubmit}
        isLoading={isLoading}
        onClick={handleOnClickButton}
      >
        儲存
      </PrimaryButton>
    </form>
  )
}
