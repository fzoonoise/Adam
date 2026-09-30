import { type MouseEventHandler, useState } from 'react'
import { useRouter } from 'next/router'
import {
  signInWithEmailAndPassword,
  updatePassword,
  type UserCredential,
} from 'firebase/auth'

import { Label } from '@/components/ui/label'
import { auth } from '@/firebase'
import { isValidPassword } from '@/utils'
import { generateErrorReportInfo } from '@/utils/log/error-log'
import { sendErrorLog } from '@/utils/log/send-log'
import { normalizeError } from '@/utils/normalize-error'

import { InputState } from '../authentication-form'

import GenericPasswordInput from './password-input'
import PrimaryButton from './primary-button'

type OldPasswordState = typeof InputState.Start | typeof InputState.Invalid

const getValidity = (password: string) =>
  isValidPassword(password) ? InputState.Valid : InputState.Incomplete

export default function MainForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [oldPasswordState, setOldPasswordState] = useState<OldPasswordState>(
    InputState.Start
  )
  const [newPassword, setNewPassword] = useState('')
  const newPasswordState = getValidity(newPassword)
  const [newPasswordCheck, setNewPasswordCheck] = useState('')
  const newPasswordCheckState =
    newPassword === ''
      ? InputState.Incomplete
      : newPassword === newPasswordCheck
        ? InputState.Valid
        : InputState.Incomplete

  const handleOnClickButton: MouseEventHandler<
    HTMLButtonElement
  > = async () => {
    if (isLoading) return

    setIsLoading(true)

    const email = auth.currentUser?.email
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
      setIsLoading(false)
      return
    }

    try {
      await updatePassword(userCredential.user, newPassword)
      void router.push('/password-change-success')
    } catch (error) {
      const errorReport = generateErrorReportInfo(normalizeError(error), {
        userEmail: email,
      })
      sendErrorLog(errorReport)
      void router.push({
        pathname: '/password-change-fail',
        query: { from: router.pathname },
      })
    }
    setIsLoading(false)
  }

  return (
    <form className="mt-4 flex flex-col gap-6">
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
          onChange={(event) => setOldPassword(event.target.value)}
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
          placeholder="密碼須在 6 位數以上"
          incompleteMessage="密碼在 6 位數以上"
          validMessage="密碼在 6 位數以上"
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
          incompleteMessage="兩次密碼須相符"
          validMessage="兩次密碼須相符"
          onChange={(event) => setNewPasswordCheck(event.target.value)}
          value={newPasswordCheck}
          state={newPasswordCheckState}
        />
      </div>
      <PrimaryButton
        disabled={newPasswordCheckState !== InputState.Valid}
        isLoading={isLoading}
        onClick={handleOnClickButton}
      >
        儲存
      </PrimaryButton>
    </form>
  )
}
