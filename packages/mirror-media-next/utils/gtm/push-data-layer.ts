import { sendGTMEvent } from '@next/third-parties/google'

import {
  DATA_LAYER_DIMENSION_KEYS,
  type InteractionEvent,
  type ResolvedDataLayerPayload,
} from '@/types/dataLayer'
import { compactDataLayer } from '@/utils/gtm/build-data-layer'
import { takeStoryListForPageView } from '@/utils/gtm/story-list'

/**
 * 首次進站與 CSR 換頁時更新 dataLayer 維度，並送獨立事件 `mm_page_view`。
 * 非本頁欄位會清成 undefined，避免上一頁殘留。
 * 與 GTM 內建 page_view 並存，GA4 不要把它映射成 `page_view`。
 */
export function pushDataLayer(fields: ResolvedDataLayerPayload = {}) {
  if (typeof window === 'undefined') {
    return
  }

  const storyList = takeStoryListForPageView()
  const compact = compactDataLayer({
    ...fields,
    ...(storyList ? { story_list: storyList } : {}),
  })
  const payload: Record<string, string | undefined> = {
    event: 'mm_page_view',
  }

  for (const key of DATA_LAYER_DIMENSION_KEYS) {
    payload[key] = compact[key]
  }

  sendGTMEvent(payload)
}

/**
 * 送出互動事件。click_item / share 的 term、share_channel 由 GTM 讀 GTM-* class，不要放進 payload。
 */
export function sendInteractionEvent(payload: InteractionEvent) {
  if (typeof window === 'undefined') {
    return
  }

  sendGTMEvent(payload)
}
