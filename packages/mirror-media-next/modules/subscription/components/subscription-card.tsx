import { CheckIcon } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'

import {
  BASIC_FEATURES,
  PREMIUM_FEATURES,
  PRIZE_LIST,
} from '../subscription-data'

import PlanActionLink from './plan-action-link'

function FeatureList({ features }: { features: readonly string[] }) {
  return (
    <ul className="mt-6">
      {features.map((feature) => (
        <li
          className="flex border-b border-mm-neutral-200 py-3 first:pt-0 last:border-0"
          key={feature}
        >
          <CheckIcon
            className="mr-1 size-5 shrink-0 text-mm-second-700"
            aria-hidden="true"
          />
          <Typography
            as="span"
            className="text-mm-neutral-800"
            variant="body-l"
          >
            {feature}
          </Typography>
        </li>
      ))}
    </ul>
  )
}

function RibbonBadge() {
  return (
    <svg
      className="h-20 w-12"
      viewBox="0 0 48 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="推薦方案"
      role="img"
    >
      <path d="M18 0H0V80L24 70.4L48 80V0H18Z" fill="#EAC151" />
      <path
        d="M23.5 46.1a13.25 13.25 0 1 0 0-26.5 13.25 13.25 0 0 0 0 26.5Zm-3.6-6.6c-.8.6-1.7 0-1.4-1l1.5-4.2-3.7-2.6c-.7-.6-.5-1.7.6-1.6l4.4.1 1.4-4.4c.3-.9 1.3-.9 1.6 0l1.4 4.3 4.5-.1c1.1 0 1.2 1.1.5 1.7l-3.7 2.6 1.5 4.2c.3 1-.6 1.6-1.4 1l-3.6-2.6-3.6 2.6Z"
        fill="white"
      />
    </svg>
  )
}

function cardClassName() {
  return 'relative flex h-full w-full flex-col rounded-mm-xl border-mm-neutral-200 p-4 shadow-lg legacy-xl:w-117 legacy-xl:p-6'
}

function BasicSubscriptionCard() {
  return (
    <Card className={cardClassName()}>
      <Typography as="h3" className="font-medium" variant="h3">
        Basic 會員
      </Typography>
      <FeatureList features={BASIC_FEATURES} />
      <PlanActionLink
        className="mt-auto"
        href="/login?destination=%2Fsubscribe"
        title="加入會員"
        tone="outline"
      />
    </Card>
  )
}

function PremiumSubscriptionCard({
  planTitle = 'Premium 會員',
  shouldHideMonthlyButton = false,
}: {
  planTitle?: string
  shouldHideMonthlyButton?: boolean
}) {
  return (
    <Card className={cardClassName()}>
      <div className="absolute -top-px -right-px overflow-hidden rounded-tr-mm-xl">
        <RibbonBadge />
      </div>
      <Typography as="h3" className="font-medium" variant="h3">
        {planTitle}
      </Typography>
      <FeatureList features={PREMIUM_FEATURES} />
      <div className="mt-6 grid gap-3">
        <PlanActionLink
          href="/subscribe/info?plan=yearly"
          subtitle={`優惠 ${PRIZE_LIST.yearly} 元`}
          title="訂購年方案"
        />
        {!shouldHideMonthlyButton && (
          <PlanActionLink
            href="/subscribe/info?plan=monthly"
            subtitle={`優惠 ${PRIZE_LIST.monthly} 元`}
            title="訂購月方案"
            tone="second"
          />
        )}
      </div>
    </Card>
  )
}

export { BasicSubscriptionCard, PremiumSubscriptionCard }
