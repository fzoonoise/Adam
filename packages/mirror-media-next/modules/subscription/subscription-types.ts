type SubscriptionViewerKind =
  | 'nonMember'
  | 'basicMember'
  | 'monthlyMember'
  | 'yearlyMember'

type SubscriptionNotice = {
  id: number
  isWarning?: boolean
  prefix: string
  link?: {
    href: string
    label: string
  }
  suffix?: string
}

export type { SubscriptionNotice, SubscriptionViewerKind }
