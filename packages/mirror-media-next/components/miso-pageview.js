/**
 * 用於在載入頁面時向 Miso 回報 pageview 的 component。
 * 此元件僅用於 client-side（務必使用 dynamic import），並依據登入狀態與 `firebaseId` 回傳互動資料。
 *
 * @component
 * @param {Object} props - Component props
 * @param {string[] | 'href'} props.productIds
 *
 * @returns {null} 此元件不會渲染任何可見內容，僅用於觸發 Miso 上報邏輯
 */
import { useEffect, useState } from 'react'

import { MISO_API_KEY } from '../config/index.mjs'
import { useMembership } from '../modules/membership/membership-context'

import MisoScript from './miso-script'

export default function MisoPageView({ productIds }) {
  const { isLogInProcessFinished, firebaseId } = useMembership()
  const [isMisoReady, setIsMisoReady] = useState(false)

  useEffect(() => {
    if (!isMisoReady) {
      return
    }

    // Wait for page to be fully rendered before executing miso code
    const executeMiso = () => {
      const uploadPageView = () => {
        // @ts-ignore: Property 'MisoClient' does not exist on type 'Window & typeof globalThis'.
        const MisoClient = window.MisoClient
        if (!MisoClient) {
          return
        }

        const client = new MisoClient(MISO_API_KEY)
        if (isLogInProcessFinished) {
          if (firebaseId) {
            client.context.user_id = firebaseId
          }
          client.api.interactions.upload({
            type: 'product_detail_page_view',
            product_ids: [`mirrormedia_${productIds}`],
          })
        }
      }

      // @ts-ignore: Property 'MisoClient' does not exist on type 'Window & typeof globalThis'.
      if (window.MisoClient) {
        uploadPageView()
        return
      }

      // @ts-ignore: Property 'misocmd' does not exist on type 'Window & typeof globalThis'.
      const misocmd = window.misocmd || (window.misocmd = [])
      misocmd.push(uploadPageView)
    }

    // Execute after page is fully loaded to avoid blocking TTFB
    if (document.readyState === 'complete') {
      // Page already loaded, execute immediately
      executeMiso()
    } else {
      // Wait for page to finish loading
      window.addEventListener('load', executeMiso, { once: true })
    }

    return () => {
      window.removeEventListener('load', executeMiso)
    }
  }, [firebaseId, isLogInProcessFinished, isMisoReady, productIds])

  return <MisoScript onReady={() => setIsMisoReady(true)} />
}
