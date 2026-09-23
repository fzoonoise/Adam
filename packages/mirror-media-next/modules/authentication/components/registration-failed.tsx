import { useAppDispatch } from '@/hooks/useRedux'

import { loginActions } from '../authentication-state'

import GenericFailed from './generic-failed'

export default function RegistrationFailed() {
  const dispatch = useAppDispatch()
  return (
    <GenericFailed
      primaryText="請回上一頁重試"
      onBack={() => dispatch(loginActions.goToRegistrationForm())}
    />
  )
}
