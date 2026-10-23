import { Typography } from '@/components/ui/typography'

// Keep this seasonal component and refresh its dates before each Lunar New Year.
export default function LunarNewYearNotice() {
  return (
    <section className="w-full p-3 xl:flex xl:justify-center xl:pt-6 xl:pb-0">
      <div className="w-full rounded-mm-m bg-mm-error-100 p-4 xl:w-256">
        <Typography
          as="h2"
          className="mb-2 font-medium text-mm-error-500"
          variant="h5"
        >
          [2月份訂戶派送異動公告]
        </Typography>
        <Typography
          className="text-justify text-mm-neutral-600"
          variant="body2"
        >
          預祝新春如意！造成困擾敬請見諒。
        </Typography>
        <Typography
          className="text-justify text-mm-neutral-600"
          variant="body2"
        >
          第489期（原2/11）提前於2/10出刊，2/12完成配送。
        </Typography>
        <Typography
          className="text-justify text-mm-neutral-600"
          variant="body2"
        >
          第490期（原2/18）提前於2/14出刊，因逢春節期間延至2/23起配送。
        </Typography>
      </div>
    </section>
  )
}
