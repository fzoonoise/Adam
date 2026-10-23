import Image from 'next/image'

import { cn } from '@/components/cn'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Link } from '@/components/ui/link'
import { Typography } from '@/components/ui/typography'
import PlanBannerImage from '@/public/images-next/papermag/plan-banner.jpg'
import { getNumberWithCommas } from '@/utils'

import { getPlanInfoByIdAndShouldFreight, PLAN } from '../paper-magazine-data'

const plans = [
  {
    id: PLAN.ONE_YEAR,
    title: '一年方案',
    notice: '一冊 2 本',
    tone: 'second' as const,
  },
  {
    id: PLAN.TWO_YEAR,
    title: '二年方案',
    notice: '一冊 2 本',
    tone: 'base' as const,
  },
]

const mailBody =
  '你好,%0D%0A留下您電話及姓名,會與你聯絡優惠方案%20%20謝謝%0D%0A%0D%0A紙本訂戶專線：(02)6633-3882'

function ContactLink({ desktop = false }: { desktop?: boolean }) {
  const href = desktop
    ? `https://mail.google.com/mail/u/0/?fs=1&tf=cm&to=service@mirrormedia.mg&su=官網來信：聯絡我們&body=${mailBody}`
    : `mailto:service@mirrormedia.mg?subject=官網來信：聯絡我們&body=${mailBody}`

  return (
    <Link
      className={cn(
        buttonVariants({ variant: 'outline' }),
        'rounded-mm-m no-underline shadow-md hover:no-underline',
        desktop ? 'hidden xl:inline-flex' : 'xl:hidden'
      )}
      href={href}
      variant="plain"
      rel={desktop ? 'noreferrer noopener' : undefined}
      target={desktop ? '_blank' : undefined}
    >
      聯絡我們
    </Link>
  )
}

export default function PlanSelection() {
  return (
    <section className="mx-auto flex w-full flex-col gap-3 px-5 py-6 xl:w-256 xl:px-0 xl:py-12">
      <div className="flex flex-col gap-3 xl:flex-row xl:flex-wrap xl:gap-x-15 xl:gap-y-6">
        <div className="xl:w-120 xl:shrink-0 xl:self-start">
          <Image
            className="h-auto w-full"
            src={PlanBannerImage}
            alt="紙本雜誌訂閱方案"
            priority
          />
        </div>
        <div className="flex flex-1 flex-col gap-3 xl:gap-6">
          {plans.map((plan) => {
            const details = getPlanInfoByIdAndShouldFreight(plan.id, false)
            return (
              <Card
                className="rounded-mm-xl border-mm-neutral-200 p-4 text-center shadow-lg xl:w-117"
                key={plan.id}
              >
                <Typography
                  as="h2"
                  className="font-medium md:text-mm-h1"
                  variant="h3"
                >
                  {plan.title}
                </Typography>
                <Typography
                  className="font-semibold text-mm-error-600"
                  variant="body-l"
                >
                  {plan.notice}
                </Typography>
                <hr className="my-4 border-mm-neutral-200" />
                <Typography
                  className="mb-3 text-mm-neutral-500"
                  variant="body-l"
                >
                  訂購紙本鏡週刊 {details.issue} 期，加贈{' '}
                  {details.discount.issue} 期
                </Typography>
                <Typography
                  className="mb-1 text-mm-neutral-400 line-through"
                  variant="body-l"
                >
                  原價 {getNumberWithCommas(details.basePrice)}
                </Typography>
                <Typography
                  className="mb-3 font-medium text-mm-error-500 md:text-mm-h1"
                  variant="h3"
                >
                  特價 {getNumberWithCommas(details.price)}
                </Typography>
                <Link
                  className={cn(
                    buttonVariants({
                      size: 'lg',
                      variant: plan.tone === 'second' ? 'secondary' : 'default',
                    }),
                    'h-auto min-h-18 w-full flex-col gap-1 rounded-mm-l no-underline shadow-md hover:no-underline'
                  )}
                  href={`/papermag/${plan.id}`}
                  variant="plain"
                >
                  <span className="text-lg font-medium">訂購{plan.title}</span>
                  <span className="text-mm-body2 font-normal opacity-70">
                    續訂另有優惠
                  </span>
                </Link>
              </Card>
            )
          })}
          <div className="flex flex-wrap items-center justify-center gap-3 rounded-mm-xl border border-mm-base-500 p-4 text-mm-base-500 xl:w-117 xl:justify-between xl:px-6">
            <Typography
              className="w-full text-center font-medium text-mm-base-500 xl:w-auto"
              variant="body-l"
            >
              <span className="text-mm-error-600">樂齡、師生</span>訂閱優惠方案
            </Typography>
            <ContactLink />
            <ContactLink desktop />
          </div>
        </div>
      </div>
    </section>
  )
}
