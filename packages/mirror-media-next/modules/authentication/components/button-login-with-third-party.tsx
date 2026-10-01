import { useMemo } from 'react'
import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithRedirect,
} from 'firebase/auth'

import { auth } from '@/firebase'
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux'
import IconApple from '@/public/images-next/login/apple.svg'
import IconFacebook from '@/public/images-next/login/facebook.svg'
import IconGoogle from '@/public/images-next/login/google.svg'

import {
  AuthMethod,
  loginActions,
  loginIsFederatedRedirectResultLoading,
  type ThirdPartyAuthMethod,
} from '../authentication-state'

import DefaultButton from './default-button'

type ButtonLoginWithThirdPartyProps = {
  thirdPartyName: ThirdPartyAuthMethod
}

type ThirdPartyProvider =
  | GoogleAuthProvider
  | FacebookAuthProvider
  | OAuthProvider

const createProvider = (
  thirdPartyName: ThirdPartyAuthMethod
): ThirdPartyProvider => {
  switch (thirdPartyName) {
    case AuthMethod.Google:
      return new GoogleAuthProvider()
    case AuthMethod.Facebook:
      return new FacebookAuthProvider()
    case AuthMethod.Apple:
      return new OAuthProvider('apple.com')
    default: {
      const unhandledMethod: never = thirdPartyName
      throw new Error(
        `Unexpected third-party authentication method: ${String(unhandledMethod)}`
      )
    }
  }
}

export default function ButtonLoginWithThirdParty({
  thirdPartyName,
}: ButtonLoginWithThirdPartyProps) {
  const dispatch = useAppDispatch()
  const isFederatedRedirectResultLoading = useAppSelector(
    loginIsFederatedRedirectResultLoading
  )
  const provider = useMemo(() => {
    const authProvider = createProvider(thirdPartyName)
    authProvider.addScope('email')
    return authProvider
  }, [thirdPartyName])

  const SvgIcon = useMemo(() => {
    switch (thirdPartyName) {
      case AuthMethod.Google:
        return IconGoogle
      case AuthMethod.Facebook:
        return IconFacebook
      case AuthMethod.Apple:
        return IconApple
      default: {
        const unhandledMethod: never = thirdPartyName
        throw new Error(
          `Unexpected third-party authentication icon: ${String(unhandledMethod)}`
        )
      }
    }
  }, [thirdPartyName])

  const handleThirdPartyFirebaseLogin = async () => {
    if (isFederatedRedirectResultLoading) return
    dispatch(loginActions.changeIsFederatedRedirectResultLoading(true))
    await signInWithRedirect(auth, provider)
  }

  return (
    <DefaultButton
      isLoading={isFederatedRedirectResultLoading}
      onClick={handleThirdPartyFirebaseLogin}
    >
      <span className="flex items-center gap-2">
        <SvgIcon className="size-5" />
        <span>以 {thirdPartyName} 帳號繼續</span>
      </span>
    </DefaultButton>
  )
}
