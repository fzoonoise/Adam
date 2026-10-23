import { cn } from '@/components/cn'
import { buttonVariants } from '@/components/ui/button'
import { Link } from '@/components/ui/link'
import { Typography } from '@/components/ui/typography'
import { PRIZE_LIST } from '@/modules/subscription/subscription-data'

export default function JoinPremiumMember() {
  return (
    <main className="flex min-h-[65vh] items-center justify-center">
      <div className="mt-6 mb-9 w-full px-5 md:mt-12 md:mb-52 md:w-170 md:px-0">
        <Typography className="mb-4 font-medium" variant="h3">
          動態雜誌
        </Typography>
        <Typography className="mb-6 text-mm-neutral-500" variant="body-l">
          加入 Premium 會員，換取一整個世界的即時更新，立即訂閱
        </Typography>
        <div className="flex w-full flex-col items-center rounded-mm-xl border border-mm-neutral-200 bg-white px-4 pt-6 pb-4 shadow-lg md:w-170 md:p-6">
          <Typography className="text-center font-medium" variant="body-l">
            準備好升級為鏡週刊 Premium 會員了嗎？
          </Typography>
          <Typography
            className="mb-3 text-center text-mm-neutral-500"
            variant="body2"
          >
            {`每期 $${PRIZE_LIST.monthly} 元，即時享受所有文章的無限閱讀，零限制探索知識的邊界。`}
          </Typography>
          <Link
            className={cn(
              buttonVariants({ size: 'lg', variant: 'secondary' }),
              'h-auto min-h-20 w-full rounded-mm-l text-mm-body-l font-medium tracking-wider no-underline shadow-md hover:no-underline md:w-120'
            )}
            href="/subscribe"
            variant="plain"
            target="_blank"
          >
            加入訂閱會員
          </Link>
        </div>
      </div>
    </main>
  )
}
