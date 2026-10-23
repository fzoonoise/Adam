import { Card } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'

import type { SubscriptionViewerKind } from '../subscription-types'

import PlanActionLink from './plan-action-link'
import {
  BasicSubscriptionCard,
  PremiumSubscriptionCard,
} from './subscription-card'
import SubscriptionNotice from './subscription-notice'

function PlansSection({ viewerKind }: { viewerKind: SubscriptionViewerKind }) {
  if (viewerKind === 'yearlyMember') {
    return (
      <section className="flex min-h-[70vh] flex-col items-center gap-10 px-5 py-10 md:bg-mm-neutral-100 md:p-12 xl:gap-12">
        <Card className="m-auto border-0 p-0 md:w-117 md:border md:border-mm-neutral-200 md:p-10 md:shadow-lg">
          <Typography as="h2" className="mb-3 font-medium" variant="h3">
            想要變更方案嗎？
          </Typography>
          <Typography className="mb-6 text-mm-neutral-500" variant="body-l">
            您目前訂閱的方案為
            <span className="text-mm-base-500">
              鏡週刊 Premium 服務-年訂閱方案
            </span>
            。如需變更，請先取消目前的方案，再重新訂閱新的方案。
          </Typography>
          <PlanActionLink href="/subscribe/set" title="前往付款設定" />
        </Card>
      </section>
    )
  }

  const isNonMember = viewerKind === 'nonMember'
  const isMonthlyMember = viewerKind === 'monthlyMember'

  return (
    <>
      <section className="bg-mm-neutral-100 px-5 pt-6 pb-12 md:p-12 xl:px-30 xl:py-15">
        <div className="mx-auto flex flex-col items-center gap-6 md:gap-8 xl:w-240">
          {!isMonthlyMember && (
            <Typography as="h2" className="w-full font-medium" variant="h3">
              方案選擇
            </Typography>
          )}
          <div
            className={
              isNonMember
                ? 'grid w-full gap-4 md:grid-cols-2 md:gap-6'
                : 'w-full max-w-117'
            }
          >
            <PremiumSubscriptionCard
              planTitle={isMonthlyMember ? '變更為年訂閱方案' : undefined}
              shouldHideMonthlyButton={isMonthlyMember}
            />
            {isNonMember && <BasicSubscriptionCard />}
          </div>
        </div>
      </section>
      <SubscriptionNotice />
    </>
  )
}

export default PlansSection
