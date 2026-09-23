import { useAppDispatch, useAppSelector } from '@/hooks/useRedux'

import { FormMode, loginActions, loginFormMode } from '../authentication-state'

import GenericFailed from './generic-failed'

export default function LoginFailed() {
  const formMode = useAppSelector(loginFormMode)
  const dispatch = useAppDispatch()

  const handleBack = () => {
    if (formMode === FormMode.Login) {
      dispatch(loginActions.goToLoginForm())
      return
    }
    dispatch(loginActions.goToStart())
  }

  return <GenericFailed primaryText="請回上一頁重新登入" onBack={handleBack} />
}
