import { useEffect, useRef, useState } from 'react'

import FormWrapper from '@/components/common/form-wrapper'
import useClipboard from '@/hooks/use-clipboard'

import { detectMobileOs } from '../authentication-utils'

import DefaultButton from './default-button'
import PrimaryButton from './primary-button'
import StyledLink from './styled-link'

const IOS_APP_LINK = 'https://itunes.apple.com/tw/app/鏡傳媒/id1186614515'
const ANDROID_APP_LINK =
  'https://play.google.com/store/apps/details?id=com.mirrormedia.news'
const APP_LINK_POST = 'https://www.mirrormedia.mg/story/20161228corpmkt001'

export default function WebviewHint() {
  const [appLink, setAppLink] = useState('')
  const fullURL = useRef('')
  const intentURL = useRef('')
  const { write, getPopup } = useClipboard()

  useEffect(() => {
    fullURL.current = window.location.href

    const mobileOS = detectMobileOs(window.navigator.userAgent)
    if (mobileOS === 'ios') {
      setAppLink(IOS_APP_LINK)
      const urlWithoutPrefix = fullURL.current.replace(
        `${window.location.protocol}//`,
        ''
      )
      intentURL.current = `x-safari-https://${urlWithoutPrefix}`
    } else if (mobileOS === 'android') {
      setAppLink(ANDROID_APP_LINK)
      intentURL.current = `intent:${fullURL.current}#Intent;end`
    } else {
      setAppLink(APP_LINK_POST)
    }
  }, [])

  const openInExternalBrowser = () => {
    window.location.href = intentURL.current
  }

  return (
    <>
      {getPopup('已複製網址')}
      <main className="flex flex-col items-center">
        <FormWrapper>
          <div className="mb-8 font-mm-sans text-lg leading-normal text-mm-neutral-500">
            請複製網址至瀏覽器繼續登入，或至
            <StyledLink href={appLink} target="_blank" rel="noreferrer">
              我們的App
            </StyledLink>
            進行瀏覽。
          </div>
          <div className="flex flex-col gap-3">
            <PrimaryButton onClick={openInExternalBrowser}>
              以外部瀏覽器開啟
            </PrimaryButton>
            <DefaultButton onClick={() => write(fullURL.current)}>
              複製此網址
            </DefaultButton>
          </div>
        </FormWrapper>
      </main>
    </>
  )
}
