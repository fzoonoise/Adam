import { CheckIcon } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import RecommendedPlanRibbon from '@/public/images-next/subscription/recommended-plan-ribbon.svg'

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
    <RecommendedPlanRibbon
      className="h-20 w-12"
      aria-label="推薦方案"
      role="img"
    />
  )
}

function cardClassName() {
  return 'relative flex h-full w-full flex-col rounded-mm-xl border-mm-neutral-200 p-4 shadow-lg xl:w-117 xl:p-6'
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
  planTitle?: string // The title of the subscription plan.
  shouldHideMonthlyButton?: boolean // Whether to hide the monthly subscription button.
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
