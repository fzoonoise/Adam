import { cn } from '@/components/cn'
import { Link } from '@/components/ui/link'
import { Typography } from '@/components/ui/typography'

import { SUBSCRIPTION_NOTICES } from '../subscription-data'

export default function SubscriptionNotice() {
  return (
    <section className="mx-5 my-6 min-h-25 bg-white leading-normal md:m-12 xl:mx-auto xl:w-240">
      <Typography
        as="h2"
        className="mb-3 font-medium text-mm-neutral-500"
        variant="h3"
      >
        注意事項
      </Typography>
      <ul className="list-disc pl-5 marker:text-mm-neutral-500">
        {SUBSCRIPTION_NOTICES.map((notice) => (
          <li
            className={cn(
              'font-mm-sans text-mm-body2 text-mm-neutral-500',
              notice.isWarning && 'text-mm-error-500'
            )}
            key={notice.id}
          >
            {notice.prefix}
            {notice.link && (
              <Link className="ml-1" href={notice.link.href}>
                {notice.link.label}
              </Link>
            )}
            {notice.suffix}
          </li>
        ))}
      </ul>
    </section>
  )
}
