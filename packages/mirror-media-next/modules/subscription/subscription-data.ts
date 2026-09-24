import type { SubscriptionNotice } from './subscription-types'

const PRIZE_LIST = {
  yearly: 1800,
  monthly: 35,
  oneTime: 10,
} as const

const PREMIUM_FEATURES = [
  '支持鏡週刊報導精神',
  '暢讀鏡週刊全站內容',
  '會員專區零廣告純淨閱覽',
  '專區好文不分頁流暢閱讀',
  '免費閱讀數位版動態雜誌',
  `月方案定價 $99 元，限時優惠 $${PRIZE_LIST.monthly} 元`,
  `年方案定價 $1,188 元，限時優惠 $${PRIZE_LIST.yearly} 元`,
] as const

const BASIC_FEATURES = [
  '支持鏡週刊報導精神',
  '好文解鎖 隨心所欲',
  `$${PRIZE_LIST.oneTime} 元可享單篇好文 14 天無限瀏覽`,
] as const

const SUBSCRIPTION_NOTICES: SubscriptionNotice[] = [
  {
    id: 0,
    prefix: '月方案計算天數為 30 日，年方案計算天數為 365 日。',
  },
  {
    id: 1,
    prefix:
      '月訂閱方案經會員授權扣款購買即為完成服務，因此月費會員無法退費，但可取消繼續訂閱。',
  },
  {
    id: 2,
    isWarning: true,
    prefix:
      '訂閱購買的同時會開啓自動續費（扣款），在訂閱到期時將依據原訂閱方案自動扣款，並延續訂閱。',
  },
  {
    id: 3,
    prefix: '訂閱相關問題請 email 至會員專屬客服信箱',
    link: {
      href: 'mailto:MM-onlineservice@mirrormedia.mg',
      label: 'MM-onlineservice@mirrormedia.mg',
    },
    suffix: '，我們會盡快為您協助處理。',
  },
  {
    id: 4,
    prefix: '更多詳細內容，請至',
    link: {
      href: '/story/service-rule/',
      label: '服務條款',
    },
    suffix: '。',
  },
]

export { BASIC_FEATURES, PREMIUM_FEATURES, PRIZE_LIST, SUBSCRIPTION_NOTICES }
