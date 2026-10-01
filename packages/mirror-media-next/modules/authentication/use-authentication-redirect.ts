import { useCallback } from 'react'
import { useRouter } from 'next/router'

import { getAuthenticationDestination } from './authentication-redirect'

export default function useRedirect() {
  const router = useRouter()

  const redirect = useCallback(() => {
    if (!router.isReady) {
      return
    }
    const destination = getAuthenticationDestination(
      router.query,
      window.location.origin
    )

    // TODO: there are some privileged pages under construction,
    // so we can't use router.replace
    window.location.replace(destination)
  }, [router])

  return { redirect }
}
