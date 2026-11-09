import { useAppDispatch } from '@/hooks/useRedux'

import { loginActions } from '../authentication-state'

import GenericFailed from './generic-failed'

export default function RegistrationFailed() {
  const dispatch = useAppDispatch()
  return (
    <GenericFailed
      primaryText="無法完成註冊，請重試或改用其他登入方式。"
      onBack={() => dispatch(loginActions.goToRegistrationForm())}
      onLogin={() => {
        dispatch(loginActions.goToStart())
      }}
    />
  )
}
