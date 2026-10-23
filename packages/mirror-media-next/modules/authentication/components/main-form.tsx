import Image from 'next/image'

import FormWrapper from '@/components/common/form-wrapper'
import { Typography } from '@/components/ui/typography'
import { useAppSelector } from '@/hooks/useRedux'
import DesktopBanner from '@/public/images-next/login/banner-desktop.png'
import MobileBanner from '@/public/images-next/login/banner-mobile.png'
import TabletBanner from '@/public/images-next/login/banner-tablet.png'

import { FormMode, loginFormMode } from '../authentication-state'

import MainFormLoginWithPassword from './main-form-login-with-password'
import MainFormRegistration from './main-form-registration'
import MainFormStart from './main-form-start'

export default function MainForm() {
  const formMode = useAppSelector(loginFormMode)

  const getFormContentByMode = () => {
    switch (formMode) {
      case FormMode.Start:
        return <MainFormStart />
      case FormMode.Registration:
        return <MainFormRegistration />
      case FormMode.Login:
        return <MainFormLoginWithPassword />
      default: {
        const unhandledMode: never = formMode
        throw new Error(`Unexpected login form mode: ${String(unhandledMode)}`)
      }
    }
  }

  return (
    <main className="flex flex-col items-center">
      <Image
        src={MobileBanner}
        alt="mobile banner"
        className="block h-auto w-screen md:hidden"
      />
      <Image
        src={TabletBanner}
        alt="tablet banner"
        className="hidden h-auto w-screen md:block 2xl:hidden"
      />
      <Image
        src={DesktopBanner}
        alt="desktop banner"
        className="hidden h-auto w-screen 2xl:block"
      />
      <section className="mx-5 mt-12 max-w-149 font-mm-sans text-mm-neutral-700 md:w-152 md:max-w-none 2xl:w-219">
        <Typography
          as="h1"
          className="mb-4 text-center leading-normal font-medium md:mb-5 2xl:mb-8"
          variant="h3"
        >
          歡迎加入鏡週刊會員訂閱服務
        </Typography>
        <Typography className="leading-normal" variant="body-l">
          在資訊爆炸與碎片的年代，新聞更需回歸純粹，讓閱讀更清澈、真實與深度。因此我們秉持明鏡之心，充份反映事實，反映時代與反映人性，持續挖掘有料內容，以一手原創題材、深度調查報導為宗旨，讓閱聽大眾獲取最完整的資訊。
        </Typography>
        <br />
        <Typography className="leading-normal" variant="body-l">
          現在，請立即加入，成為我們的會員，體驗有質量、無干擾的新聞閱讀。
        </Typography>
      </section>
      <FormWrapper className="2xl:my-15">{getFormContentByMode()}</FormWrapper>
    </main>
  )
}
