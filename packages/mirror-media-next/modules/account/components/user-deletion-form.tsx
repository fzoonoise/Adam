import { Link } from '@/components/ui/link'
import { Typography } from '@/components/ui/typography'

export default function UserDeletionForm() {
  return (
    <div className="mt-20 md:mt-12">
      <Link
        href="/cancelMembership"
        variant="plain"
        className="text-lg leading-normal font-medium text-mm-error-500 underline"
      >
        刪除會員
      </Link>
      <Typography
        className="mt-3 leading-normal text-mm-neutral-500"
        variant="body-l"
      >
        提醒您，若您有訂閱會員專區單篇文章，刪除帳號可能導致無法閱讀文章。
      </Typography>
    </div>
  )
}
