import { useRef, useState } from 'react'

import { cn } from '@/components/cn'
import FormWrapper from '@/components/common/form-wrapper'
import { Button } from '@/components/ui/button'
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux'

import { InputState } from '../authentication-form'
import {
  AuthMethod,
  FormMode,
  loginActions,
  loginFormMode,
  loginIsFederatedRedirectResultLoading,
  loginShouldShowHintOfExistenceOfDifferentAuthMethod,
  type ThirdPartyAuthMethod,
} from '../authentication-state'

import ButtonLoginWithThirdParty from './button-login-with-third-party'
import CenteredHint from './centered-input-hint'
import MainFormLoginWithPassword from './main-form-login-with-password'
import MainFormRegistration from './main-form-registration'
import ReminderSection from './reminder-section'

const THIRD_PARTY_LIST: ThirdPartyAuthMethod[] = [
  AuthMethod.Facebook,
  AuthMethod.Google,
  AuthMethod.Apple,
]

export default function MainFormStart() {
  const dispatch = useAppDispatch()
  const formMode = useAppSelector(loginFormMode)
  const isRegistration = formMode === FormMode.Registration
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submissionPending = useRef(false)
  const isFederatedRedirectResultLoading = useAppSelector(
    loginIsFederatedRedirectResultLoading
  )
  const shouldShowHintOfExistenceOfDifferentAuthMethod = useAppSelector(
    loginShouldShowHintOfExistenceOfDifferentAuthMethod
  )
  const isSwitchDisabled = isSubmitting || isFederatedRedirectResultLoading

  const handleSubmittingChange = (pending: boolean) => {
    submissionPending.current = pending
    setIsSubmitting(pending)
  }

  const handleModeChange = (
    mode: typeof FormMode.Login | typeof FormMode.Registration
  ) => {
    if (
      submissionPending.current ||
      isFederatedRedirectResultLoading ||
      isRegistration === (mode === FormMode.Registration)
    )
      return

    dispatch(loginActions.clearPassword())
    dispatch(
      loginActions.changeShouldShowHintOfExistenceOfDifferentAuthMethod(false)
    )
    dispatch(
      mode === FormMode.Login
        ? loginActions.goToLoginForm()
        : loginActions.goToRegistrationForm()
    )
  }

  const modeSwitch = (
    <div className="mb-6 flex w-full" role="group" aria-label="選擇登入或註冊">
      {[FormMode.Login, FormMode.Registration].map((mode) => {
        const active = isRegistration === (mode === FormMode.Registration)
        return (
          <Button
            key={mode}
            type="button"
            variant={active ? 'default' : 'ghost'}
            aria-pressed={active}
            disabled={isSwitchDisabled}
            onClick={() => handleModeChange(mode)}
            className={cn(
              'h-14 flex-1 rounded-none px-4 py-3 text-lg leading-normal font-medium first:rounded-l-lg last:rounded-r-lg disabled:opacity-100',
              !active &&
                'bg-white text-mm-base-500 ring-1 ring-mm-base-500 ring-inset hover:bg-mm-neutral-100'
            )}
          >
            {mode === FormMode.Login ? '登入' : '註冊'}
          </Button>
        )
      })}
    </div>
  )

  // Hidden panels reserve the taller layout; remounting clears local errors on mode changes.
  return (
    <div
      className="grid w-full"
      key={isRegistration ? FormMode.Registration : FormMode.Login}
    >
      <section
        className={cn(
          'col-start-1 row-start-1 flex min-w-0 justify-center self-start',
          isRegistration && 'invisible'
        )}
        aria-label="登入"
        aria-hidden={isRegistration}
        inert={isRegistration}
      >
        <FormWrapper className="2xl:my-15">
          {modeSwitch}
          <fieldset
            className="m-0 flex min-w-0 flex-col gap-3 border-0 p-0 disabled:opacity-50"
            aria-label="第三方登入"
            disabled={isSubmitting}
          >
            {THIRD_PARTY_LIST.map((thirdPartyName) => (
              <ButtonLoginWithThirdParty
                key={thirdPartyName}
                thirdPartyName={thirdPartyName}
              />
            ))}
            {shouldShowHintOfExistenceOfDifferentAuthMethod && (
              <CenteredHint state={InputState.Invalid}>
                無法完成登入，請重試或改用其他登入方式。
              </CenteredHint>
            )}
          </fieldset>
          <div className="my-4 flex items-center font-mm-sans text-mm-caption-s text-mm-neutral-400 before:h-px before:grow before:bg-mm-neutral-200 after:h-px after:grow after:bg-mm-neutral-200">
            <span className="mx-3">或</span>
          </div>
          <MainFormLoginWithPassword
            onSubmittingChange={handleSubmittingChange}
          />
          <ReminderSection />
        </FormWrapper>
      </section>
      <section
        className={cn(
          'col-start-1 row-start-1 flex min-w-0 justify-center self-start',
          !isRegistration && 'invisible'
        )}
        aria-label="註冊"
        aria-hidden={!isRegistration}
        inert={!isRegistration}
      >
        <FormWrapper className="2xl:my-15">
          {modeSwitch}
          <MainFormRegistration onSubmittingChange={handleSubmittingChange} />
          <ReminderSection />
        </FormWrapper>
      </section>
    </div>
  )
}
